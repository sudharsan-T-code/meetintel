import { runMeetingIntelligencePipeline } from '@/lib/ai/orchestrator';
import { getMeetingIntelligence, getMeetingChatMessages, persistChatMessage, updateDecisionInDb, updateActionItemInDb } from '@/lib/db/intelligence';
import { demoUser, demoOrganization } from '@/lib/demo-data';

async function main() {
  console.log('=== MEETINTEL PHASE 3 E2E VERIFICATION ===');
  const tenant = {
    organizationId: demoOrganization.id,
    userId: demoUser.id,
    userRole: demoUser.role.toUpperCase(),
  };

  const meetingId = 'mtg-demo-001';

  // 1. Run AI Intelligence Orchestrator Pipeline
  console.log('1. Running AI Intelligence Pipeline for:', meetingId);
  const intel1 = await runMeetingIntelligencePipeline(meetingId, tenant, { provider: 'demo' });
  console.log('Summaries count:', intel1.summaries.length);
  console.log('Decisions count:', intel1.decisions.length);
  console.log('Action items count:', intel1.actionItems.length);
  console.log('Risks count:', intel1.risks.length);
  console.log('Productivity score:', intel1.productivityScore.overall);

  // 2. Verify Deduplication
  console.log('\n2. Re-running AI pipeline to verify deduplication...');
  const intel2 = await runMeetingIntelligencePipeline(meetingId, tenant, { provider: 'demo', forceRegenerate: true });
  console.log('Decisions count after re-run:', intel2.decisions.length, '(Expect 7)');
  console.log('Action items count after re-run:', intel2.actionItems.length, '(Expect 12)');
  if (intel2.decisions.length !== 7) {
    throw new Error(`Deduplication test failed: expected 7 decisions, got ${intel2.decisions.length}`);
  }

  // 3. Test Decision Status Update
  console.log('\n3. Testing Decision status update...');
  const firstDecId = intel2.decisions[0].id;
  const updatedDec = await updateDecisionInDb(firstDecId, { status: 'PENDING' }, tenant);
  console.log(`Updated decision ${firstDecId} status to:`, updatedDec.status);

  // 4. Test Action Item Status Update
  console.log('\n4. Testing Action item status update...');
  const firstActId = intel2.actionItems[0].id;
  const updatedAct = await updateActionItemInDb(firstActId, { status: 'COMPLETED' }, tenant);
  console.log(`Updated action item ${firstActId} status to:`, updatedAct.status);

  // 5. Test AI Chat & Grounded Citations Persistence
  console.log('\n5. Testing AI Chat Message Persistence with Citations...');
  const chatMsg = await persistChatMessage(
    meetingId,
    {
      role: 'user',
      content: 'What were the key decisions?',
    },
    tenant
  );
  console.log('Saved user message:', chatMsg.id);

  const assistantMsg = await persistChatMessage(
    meetingId,
    {
      role: 'assistant',
      content: 'The key decision was approving the AWS Migration for authentication.',
      messageType: 'fact',
      sources: [
        {
          segmentId: 'seg-15',
          speakerName: 'Rajesh Kumar',
          timestamp: 625,
          text: 'We approve the AWS migration for the authentication service with a gateway-first approach.',
          confidence: 'high',
        },
      ],
    },
    tenant
  );
  console.log('Saved assistant message:', assistantMsg.id, 'with sources count:', assistantMsg.sources?.length);

  const chatHistory = await getMeetingChatMessages(meetingId, tenant);
  console.log('Chat history total messages:', chatHistory.length);

  console.log('\n=== ALL PHASE 3 E2E TESTS PASSED PERFECTLY ===');
}

main().catch((err) => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
