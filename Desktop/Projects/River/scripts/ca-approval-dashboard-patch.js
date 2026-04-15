// ============================================================================
// CA Approval Dashboard Patch — hyper-agent-v1 P4
// ============================================================================
// Integrate this into monitoring/tender-dashboard.html
//
// 1. Add the approveCaSend function alongside existing lifecycle functions
// 2. Update the ca_drafted case in renderCards() to include the approval button
// ============================================================================

// --- Add this function near the other lifecycle action functions ---

async function approveCaSend(id) {
    const tender = allTenders.find(x => x.id === id);
    if (!tender) return;
    if (!confirm(`Approve CA send for "${tender.title}"?\n\nThis will allow the agent to send the confidentiality agreement.`)) return;

    const ok = await supaPatch(`/tender_register?id=eq.${id}`, {
        ca_send_approved: true,
        ca_send_approved_by: "jeff",
        ca_send_approved_at: new Date().toISOString(),
    });
    if (ok) {
        // Log to lifecycle audit
        await supaPost("/tender_lifecycle_log", {
            tender_id: id,
            from_stage: "ca_drafted",
            to_stage: "ca_drafted",
            actor: "jeff (dashboard)",
            rationale: "CA send approved via dashboard",
            metadata: { action: "ca_send_approval" },
        });
        await loadAll();
    }
}


// --- Replace the ca_drafted case in renderCards() with this ---
//
// Find this block:
//     case "ca_drafted":
//         actions = `<button class="btn btn-primary" onclick="markCaSent(${t.id})">Mark CA Sent</button>
//             <button class="btn btn-danger" onclick="markWithdrawn(${t.id})">Withdraw</button>`;
//         break;
//
// Replace with:

/*
    case "ca_drafted":
        if (t.ca_send_approved) {
            actions = `<span class="stage-pill" style="background:var(--green-soft);color:var(--green)">CA Send Approved</span>
                <button class="btn btn-primary" onclick="markCaSent(${t.id})">Mark CA Sent</button>
                <button class="btn btn-danger" onclick="markWithdrawn(${t.id})">Withdraw</button>`;
        } else {
            actions = `<button class="btn btn-primary" onclick="approveCaSend(${t.id})">Approve CA Send</button>
                <button class="btn btn-danger" onclick="markWithdrawn(${t.id})">Withdraw</button>`;
        }
        break;
*/

// --- Also add ca_send_approved to the select query in loadAll() ---
// Find the select parameter and ensure it includes ca_send_approved:
//     select=*
// (If using select=*, no change needed. If specific columns, add ca_send_approved.)
