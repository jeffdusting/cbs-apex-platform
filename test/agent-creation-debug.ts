// Debug Agent Creation Issue
import fetch from 'node-fetch';

interface DebugResult {
  testName: string;
  success: boolean;
  error?: string;
  data?: any;
}

async function debugAgentCreation(): Promise<DebugResult[]> {
  const baseUrl = 'http://localhost:5000';
  const results: DebugResult[] = [];

  // Test 1: Minimal valid agent
  try {
    const response = await fetch(`${baseUrl}/api/agent-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "Debug Test 1" })
    });
    
    if (response.ok) {
      const data = await response.json();
      results.push({ testName: "Minimal Agent", success: true, data });
    } else {
      const error = await response.text();
      results.push({ testName: "Minimal Agent", success: false, error });
    }
  } catch (error: any) {
    results.push({ testName: "Minimal Agent", success: false, error: error.message });
  }

  // Test 2: Agent with valid provider ID  
  try {
    const response = await fetch(`${baseUrl}/api/agent-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: "Debug Test 2",
        preferredProviderId: "openai-gpt5"
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      results.push({ testName: "Agent with Provider", success: true, data });
    } else {
      const error = await response.text();
      results.push({ testName: "Agent with Provider", success: false, error });
    }
  } catch (error: any) {
    results.push({ testName: "Agent with Provider", success: false, error: error.message });
  }

  // Test 3: Agent with null provider ID
  try {
    const response = await fetch(`${baseUrl}/api/agent-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: "Debug Test 3",
        preferredProviderId: null
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      results.push({ testName: "Agent with null Provider", success: true, data });
    } else {
      const error = await response.text();
      results.push({ testName: "Agent with null Provider", success: false, error });
    }
  } catch (error: any) {
    results.push({ testName: "Agent with null Provider", success: false, error: error.message });
  }

  // Test 4: Full agent data (mimicking UI form)
  try {
    const response = await fetch(`${baseUrl}/api/agent-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: "Marketing Specialist",
        description: "Expert in marketing strategies and campaigns",
        primaryPersonality: "Analytical",
        secondaryPersonality: "Experimental",
        isDevilsAdvocate: false,
        supplementalPrompt: "Focus on data-driven marketing approaches",
        preferredProviderId: "openai-gpt5"
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      results.push({ testName: "Full Agent Data", success: true, data });
    } else {
      const error = await response.text();
      results.push({ testName: "Full Agent Data", success: false, error });
    }
  } catch (error: any) {
    results.push({ testName: "Full Agent Data", success: false, error: error.message });
  }

  return results;
}

async function main() {
  console.log('🔍 Debugging Agent Creation Issue\n');
  
  const results = await debugAgentCreation();
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.testName}:`);
    console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.data) {
      console.log(`   Agent ID: ${result.data.id}`);
      console.log(`   Provider: ${result.data.preferredProviderId || 'null'}`);
    }
    console.log('');
  });

  // Analyze results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('📊 Summary:');
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n🔧 Root Cause Analysis:');
    const failedTests = results.filter(r => !r.success);
    
    failedTests.forEach(test => {
      if (test.testName.includes("Provider")) {
        console.log('   ⚠️  Provider ID validation is causing failures');
        console.log('   📝 Likely foreign key constraint issue in database');
      }
    });
  }
}

main().catch(console.error);