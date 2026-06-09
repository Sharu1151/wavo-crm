# User Flow Diagrams - Wavo CRM

This document contains Mermaid diagrams detailing the main user journeys across Wavo CRM: onboarding, lead progression, campaign broadcasting, and AI actions.

---

## 1. Business Owner Registration & Onboarding Flow
Describes the path a new business owner takes to register an account, create their business tenant, choose a subscription, and configure settings.

```mermaid
flowchart TD
    Start([User visits Wavo CRM]) --> CheckAuth{Auth choice?}
    CheckAuth -- Social Login --> GoogleAuth[Verify Google OAuth]
    CheckAuth -- Email / Password --> EmailRegister[Input details & verify email]
    CheckAuth -- OTP Login --> SMSOTP[Request OTP & verify code]
    
    GoogleAuth --> SetupTenant[Create Tenant: Business Profile]
    EmailRegister --> SetupTenant
    SMSOTP --> SetupTenant
    
    SetupTenant --> FillBusinessInfo[Provide Business Name, Type, Tax ID]
    FillBusinessInfo --> SubscriptionSelect{Select Plan}
    
    SubscriptionSelect -- Free Plan --> RedirectDash[Redirect to Dashboard]
    SubscriptionSelect -- Paid Plan --> PaymentGateway[Stripe/Razorpay Checkout]
    
    PaymentGateway -- Success --> ProvisionFeatures[Enable Advanced Tiers] --> RedirectDash
    PaymentGateway -- Fail --> ShowBillingError[Alert Billing Issue] --> SubscriptionSelect
```

---

## 2. Lead Management & Sales Pipeline Transition
Maps how leads are captured, assigned, moved through the Kanban pipeline, and eventually won or lost.

```mermaid
flowchart TD
    CaptureLead[Lead Captured: Inbound Webhook / Manual Form] --> AutoAssign{Assign Rules?}
    AutoAssign -- Round Robin --> TeamRep[Assign to Sales Executive]
    AutoAssign -- Unassigned --> Queue[Place in Shared Business Queue]
    
    TeamRep --> UserNotified[Push Notification: 'New Lead Assigned']
    Queue --> ManagerAssign[Manager assigns to Rep] --> UserNotified
    
    UserNotified --> RepReview[Rep opens lead detail page]
    RepReview --> QualifyLead{Interested?}
    
    QualifyLead -- Yes --> KanbanMove[Move stage to Qualified/Interested]
    QualifyLead -- No --> SetLost[Mark Stage as Lost] --> Archive([Lead Flow Completed])
    
    KanbanMove --> Propose[Create Proposal & Invoice] --> StageProposal[Move to Proposal Sent]
    StageProposal --> Negotiate[Negotiate terms & update records] --> StageNegotiation[Move to Negotiation]
    
    StageNegotiation --> CloseDeal{Closed?}
    CloseDeal -- Won --> CollectPayment[Confirm payment status] --> StageWon[Mark Closed Won] --> Archive
    CloseDeal -- Lost --> SetLost
```

---

## 3. WhatsApp Campaign Broadcast Flow
Flow illustrating how a Manager creates and triggers a bulk marketing/alert campaign targeting a subset of customers.

```mermaid
flowchart TD
    ManagerDash([Manager Dashboard]) --> SelectTemplates[Select Pre-approved WhatsApp Template]
    SelectTemplates --> SelectAudience[Filter Customer List by Tags e.g., 'VIP']
    SelectAudience --> SetupVars[Configure template variable replacements]
    SetupVars --> PreviewBroadcast[Preview sample message render]
    
    PreviewBroadcast --> RunLimitsCheck{Daily quota validation?}
    RunLimitsCheck -- Exceeded --> AlertLimit[Display warning: Reduce recipient count or upgrade plan] --> SelectAudience
    RunLimitsCheck -- Valid --> ConfirmTrigger[Approve Broadcast campaign]
    
    ConfirmTrigger --> PushToBullMQ[Push message objects to BullMQ Queue in Redis]
    
    subgraph Background Queue worker (Rate Limiting)
        PushToBullMQ --> FetchJobs[Worker pulls batch from queue]
        FetchJobs --> CallWhatsAppAPI[Post data to Meta WhatsApp API]
        CallWhatsAppAPI --> UpdateStatus[Update message status: Sent / Delivered / Read]
    end
    
    UpdateStatus --> CompleteBroadcast([Broadcast Complete & Reports updated])
```

---

## 4. AI-Powered Follow-up and Reply Workflow
Flow mapping how incoming WhatsApp customer messages leverage LLM endpoints to assist the Sales representative.

```mermaid
flowchart TD
    InboundMsg[Customer sends inbound message] --> WebhookReceive[Webhook matches customer in Database]
    WebhookReceive --> UpdateTimeline[Add message to Customer Timeline]
    UpdateTimeline --> NotifyStaff[Send alert notification to Assigned Rep]
    
    NotifyStaff --> RepOpensChat[Rep opens customer chat console]
    RepOpensChat --> TriggerAISuggest[System triggers AI Reply suggestions in background]
    
    TriggerAISuggest --> FetchContext[Retrieve last 5 messages + tags + customer notes]
    FetchContext --> CallLLMAPI[Send structured payload to Gemini/LLM API]
    CallLLMAPI --> RenderReplies[Render 3 Quick-Action text options on screen]
    
    RenderReplies --> RepSelection{Rep actions?}
    RepSelection -- Click Template --> SendTemplate[Send generated message directly]
    RepSelection -- Edit Suggestion --> ModifyText[Refine text in editor] --> SendTemplate
    RepSelection -- Dismiss --> CustomWrite[Write manual response] --> SendTemplate
    
    SendTemplate --> WebhookOutbound[WhatsApp Gateway transmits message] --> LogTimeline[Append to timeline]
```
