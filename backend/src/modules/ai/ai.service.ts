import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  // 1. Predictive Lead Scoring
  async scoreLead(leadId: string, businessId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, businessId },
      include: { customer: true },
    });
    if (!lead) {
      throw new NotFoundException('Lead not found.');
    }

    // Algorithmic calculation simulation based on data completeness
    let score = 50;
    if (lead.customer.email) score += 10;
    if (lead.customer.company) score += 10;
    if (lead.customer.notes && lead.customer.notes.length > 20) score += 15;
    if (Number(lead.estimatedValue) > 10000) score += 10;
    if (lead.customer.source === 'WhatsApp') score += 5; // higher closing rate on WA sandbox

    // Cap score at 99
    score = Math.min(score, 99);

    // Update in database
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { leadScore: score },
    });

    return { leadId, score };
  }

  // 2. AI Outreach Content Generation
  async generateOutreach(dto: { customerName: string; businessName: string; details: string; tone: string }) {
    const { customerName, businessName, details, tone } = dto;

    const templates = {
      formal: `Dear ${customerName},\n\nI hope this message finds you well. I am reaching out from ${businessName} regarding ${details}. We value your interest and would be glad to discuss how we can support your business requirements.\n\nPlease let us know your availability for a brief consultation call.\n\nSincerely,\nClient Relations\n${businessName}`,
      friendly: `Hi ${customerName}!\n\nHope you are having a great week. I wanted to drop a quick line from ${businessName} about ${details}. We'd love to help you get set up and answer any questions you might have!\n\nLet me know when you'd be free to connect for a quick chat. \n\nBest,\nYour friends at ${businessName}`,
      urgent: `Hello ${customerName},\n\nThis is a quick alert from ${businessName} regarding ${details}. Action is required to secure your slot / finalize pricing agreements. Please review this details as soon as possible and call us back.\n\nBest regards,\n${businessName} Support Team`,
    };

    const chosenTone = tone.toLowerCase();
    const content = templates[chosenTone as keyof typeof templates] || templates.friendly;

    return { content };
  }

  // 3. AI Reply Suggestions
  async suggestReplies(messageText: string) {
    const text = messageText.toLowerCase();

    if (text.includes('pricing') || text.includes('cost') || text.includes('how much')) {
      return {
        suggestions: [
          'Sure! I can send you our standard pricing breakdown brochure. Would you prefer email or WhatsApp?',
          'Our baseline plan starts at $29/month. We also have high-tier team workspace editions.',
          'Let me coordinate with our sales representative to get a customized proposal sent over.'
        ]
      };
    }

    if (text.includes('time') || text.includes('meeting') || text.includes('schedule') || text.includes('call')) {
      return {
        suggestions: [
          'I am available tomorrow morning at 10 AM. Will that time slot work for you?',
          'Let me share our Calendly scheduling link so you can choose a convenient slot.',
          'Understood. I will schedule a callback alert in our CRM system.'
        ]
      };
    }

    // Default suggestions
    return {
      suggestions: [
        'Thank you for reaching out! How can I assist your team today?',
        'I am logging these details in our database. Let me confirm that for you shortly.',
        'Got it. Let me check with our support agent and get back to you.'
      ]
    };
  }

  // 4. AI Timeline Summary
  async summarizeTimeline(customerId: string, businessId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, businessId },
      include: { leads: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    const leadCount = customer.leads.length;
    const source = customer.source;

    let summary = `${customer.fullName} is an active customer registered via ${source} channel. `;
    if (leadCount > 0) {
      const activeLeads = customer.leads.map(l => `"${l.title}" (${l.stage})`).join(', ');
      summary += `They have ${leadCount} active sales pipeline deal(s) including: ${activeLeads}. `;
    } else {
      summary += `No sales pipeline deals are currently logged. `;
    }

    if (customer.notes) {
      summary += `Additional client log notes mention: "${customer.notes}".`;
    }

    return { summary };
  }
}
