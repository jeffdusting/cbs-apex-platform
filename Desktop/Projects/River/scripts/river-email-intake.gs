/**
 * River Email Task Intake
 *
 * Polls Gmail for emails tagged [RIVER-CBS] or [RIVER-WR] from authorised
 * senders, creates Paperclip issues, and marks the emails as processed.
 *
 * Deploy in Google Apps Script at script.google.com:
 * 1. Create new project named "River Email Intake"
 * 2. Paste this file as Code.gs
 * 3. Set PAPERCLIP_COOKIE in Script Properties (Project Settings → Script Properties)
 * 4. Set up a time-driven trigger to run checkInbox() every 5 minutes
 * 5. Run checkInbox() once manually to authorise Gmail access
 */

// === CONFIGURATION ===
const PAPERCLIP_BASE = 'https://org.cbslab.app';

const COMPANY_IDS = {
    CBS: 'fafce870-b862-4754-831e-2cd10e8b203c',
    WR: '95a248d4-08e7-4879-8e66-5d1ff948e005',
};

const AGENT_IDS = {
    CBS: '01273fb5-3af2-4b2e-bf92-06da5dc8eb10',
    WR: '00fb11a2-2ede-43b0-b680-9d4b12551bb8',
};

const AUTHORISED_SENDERS = [
    'jeff@cbs.com.au',
    'sarah@cbs.com.au',
    'jeff@cobaltblu.com.au',  // also authorised
];

const PROCESSED_LABEL = 'River-Processed';

// === MAIN ENTRY POINT (set up time trigger on this) ===
function checkInbox() {
    const cookie = PropertiesService.getScriptProperties().getProperty('PAPERCLIP_COOKIE');
    if (!cookie) {
        Logger.log('ERROR: PAPERCLIP_COOKIE not set in Script Properties');
        return;
    }

    // Ensure processed label exists
    let label = GmailApp.getUserLabelByName(PROCESSED_LABEL);
    if (!label) {
        label = GmailApp.createLabel(PROCESSED_LABEL);
    }

    // Search for unprocessed River emails
    const query = `(subject:"[RIVER-CBS]" OR subject:"[RIVER-WR]") -label:${PROCESSED_LABEL}`;
    const threads = GmailApp.search(query, 0, 20);

    Logger.log(`Found ${threads.length} unprocessed River email threads`);

    for (const thread of threads) {
        try {
            processThread(thread, label, cookie);
        } catch (e) {
            Logger.log(`Error processing thread: ${e.message}`);
        }
    }
}

function processThread(thread, processedLabel, cookie) {
    const messages = thread.getMessages();
    const email = messages[0]; // first message in thread

    const from = email.getFrom();
    const subject = email.getSubject();
    const body = email.getPlainBody();
    const received = email.getDate();

    Logger.log(`Processing: ${subject} from ${from}`);

    // Extract sender email address
    const fromMatch = from.match(/<(.+?)>/) || [null, from];
    const senderEmail = (fromMatch[1] || from).toLowerCase().trim();

    // Check authorisation
    const isAuthorised = AUTHORISED_SENDERS.some(a => senderEmail.includes(a));
    if (!isAuthorised) {
        Logger.log(`Unauthorised sender: ${senderEmail} — skipping`);
        thread.addLabel(processedLabel);
        // Reply with rejection
        email.reply(
            'This mailbox only accepts tasks from authorised CBS Group addresses.\n\n' +
            'Your message has not been actioned.'
        );
        return;
    }

    // Determine entity from subject tag
    let company_id, agent_id, entity;
    if (subject.includes('[RIVER-WR]')) {
        company_id = COMPANY_IDS.WR;
        agent_id = AGENT_IDS.WR;
        entity = 'WaterRoads';
    } else {
        company_id = COMPANY_IDS.CBS;
        agent_id = AGENT_IDS.CBS;
        entity = 'CBS Group';
    }

    // Determine priority
    const priority = subject.includes('[URGENT]') ? 'high' : 'medium';

    // Clean subject (strip tags)
    const cleanSubject = subject
        .replace(/\[RIVER-CBS\]/gi, '')
        .replace(/\[RIVER-WR\]/gi, '')
        .replace(/\[URGENT\]/gi, '')
        .trim();

    // Handle attachments — save to Drive and include links
    const attachments = email.getAttachments();
    let attachmentLinks = '';
    if (attachments.length > 0) {
        const folder = getOrCreateFolder('River Email Attachments');
        attachmentLinks = '\n\nAttachments:\n';
        for (const att of attachments) {
            try {
                const file = folder.createFile(att);
                file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                attachmentLinks += `- ${att.getName()}: ${file.getUrl()}\n`;
            } catch (e) {
                attachmentLinks += `- ${att.getName()} (upload failed: ${e.message})\n`;
            }
        }
    }

    // Build issue description
    const description = `${body}\n\n---\nSubmitted by: ${senderEmail}\nReceived: ${received.toISOString()}\nEntity: ${entity}${attachmentLinks}`;

    // Create Paperclip issue
    const issue = createPaperclipIssue(company_id, agent_id, cleanSubject, description, priority, cookie);

    if (issue && issue.id) {
        // Set to todo
        setIssueStatus(issue.id, 'todo', cookie);

        // Reply to sender
        const issueUrl = `${PAPERCLIP_BASE}/companies/${company_id}/issues/${issue.id}`;
        email.reply(
            `Your task has been submitted to River.\n\n` +
            `Reference: ${issue.identifier}\n` +
            `Paperclip: ${issueUrl}\n\n` +
            `The ${entity} CEO agent will assess and respond within a few hours via Teams and email.`
        );

        Logger.log(`Created issue ${issue.identifier} for ${entity}`);
        thread.addLabel(processedLabel);
    } else {
        Logger.log(`Failed to create issue for thread`);
    }
}

function createPaperclipIssue(company_id, agent_id, title, description, priority, cookie) {
    const url = `${PAPERCLIP_BASE}/api/companies/${company_id}/issues`;
    const payload = {
        title: title,
        description: description,
        priority: priority,
        assigneeAgentId: agent_id,
    };

    const options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            'Origin': PAPERCLIP_BASE,
            'Cookie': cookie,
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();
    const text = response.getContentText();

    if (status === 200 || status === 201) {
        return JSON.parse(text);
    } else {
        Logger.log(`Paperclip API error ${status}: ${text.substring(0, 300)}`);
        return null;
    }
}

function setIssueStatus(issue_id, status, cookie) {
    const url = `${PAPERCLIP_BASE}/api/issues/${issue_id}`;
    const options = {
        method: 'patch',
        contentType: 'application/json',
        headers: {
            'Origin': PAPERCLIP_BASE,
            'Cookie': cookie,
        },
        payload: JSON.stringify({ status: status }),
        muteHttpExceptions: true,
    };
    UrlFetchApp.fetch(url, options);
}

function getOrCreateFolder(name) {
    const folders = DriveApp.getFoldersByName(name);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(name);
}

// === UTILITY: manually test the flow ===
function testWithSampleEmail() {
    // Useful for testing — searches the most recent River email
    const threads = GmailApp.search('subject:"[RIVER-CBS]" OR subject:"[RIVER-WR]"', 0, 1);
    if (threads.length === 0) {
        Logger.log('No test emails found. Send a test email to the Gmail inbox first.');
        return;
    }
    const cookie = PropertiesService.getScriptProperties().getProperty('PAPERCLIP_COOKIE');
    const label = GmailApp.getUserLabelByName(PROCESSED_LABEL) || GmailApp.createLabel(PROCESSED_LABEL);
    processThread(threads[0], label, cookie);
}
