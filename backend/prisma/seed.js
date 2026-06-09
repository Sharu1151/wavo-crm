const { PrismaClient, UserRoleName, LeadStage, ReminderType, FollowUpStatus, TaskPriority, TaskStatus, SubscriptionPlanType, SubscriptionStatus, TemplateCategory } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create Roles
  const rolesData = [
    { name: UserRoleName.SUPER_ADMIN, description: 'Super Admin with global access' },
    { name: UserRoleName.BUSINESS_OWNER, description: 'Business Owner / Tenant Admin' },
    { name: UserRoleName.MANAGER, description: 'Business Operations Manager' },
    { name: UserRoleName.SALES_EXECUTIVE, description: 'Sales Representative' },
    { name: UserRoleName.SUPPORT_EXECUTIVE, description: 'Customer Support Agent' },
    { name: UserRoleName.STAFF_USER, description: 'General Staff / Read-Only Access' },
  ];

  const roles = {};
  for (const roleInfo of rolesData) {
    roles[roleInfo.name] = await prisma.role.upsert({
      where: { name: roleInfo.name },
      update: { description: roleInfo.description },
      create: { name: roleInfo.name, description: roleInfo.description },
    });
  }
  console.log('Roles seeded successfully.');

  // 2. Create Permissions
  const permissionsData = [
    { slug: 'leads:create', description: 'Create leads' },
    { slug: 'leads:read', description: 'View leads' },
    { slug: 'leads:update', description: 'Update leads' },
    { slug: 'leads:delete', description: 'Delete leads' },
    { slug: 'customers:create', description: 'Create customers' },
    { slug: 'customers:read', description: 'View customers' },
    { slug: 'customers:update', description: 'Update customers' },
    { slug: 'customers:delete', description: 'Delete customers' },
    { slug: 'tasks:create', description: 'Create tasks' },
    { slug: 'tasks:read', description: 'View tasks' },
    { slug: 'tasks:update', description: 'Update tasks' },
    { slug: 'tasks:delete', description: 'Delete tasks' },
    { slug: 'billing:view', description: 'View billing details' },
    { slug: 'billing:manage', description: 'Manage subscriptions and billing' },
  ];

  const permissions = {};
  for (const permInfo of permissionsData) {
    permissions[permInfo.slug] = await prisma.permission.upsert({
      where: { slug: permInfo.slug },
      update: { description: permInfo.description },
      create: { slug: permInfo.slug, description: permInfo.description },
    });
  }
  console.log('Permissions seeded successfully.');

  // 3. Link permissions to BUSINESS_OWNER role
  for (const permSlug of Object.keys(permissions)) {
    const roleId = roles[UserRoleName.BUSINESS_OWNER].id;
    const permissionId = permissions[permSlug].id;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
      update: {},
      create: { roleId, permissionId },
    });
  }
  console.log('Linked all permissions to BUSINESS_OWNER role.');

  // 4. Create a test Business tenant
  const business = await prisma.business.create({
    data: {
      name: 'Acme Sales Corporation',
      businessType: 'SaaS Retail',
      address: '123 Main Street, Suite 400, New York, NY',
      phone: '+15550199',
    },
  });
  console.log(`Created test Business tenant: ${business.name} (ID: ${business.id})`);

  // 5. Create a test User (Business Owner)
  const passwordHash = await bcrypt.hash('password123', 10);
  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@wavo.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      businessId: business.id,
      roleId: roles[UserRoleName.BUSINESS_OWNER].id,
      isActive: true,
    },
  });
  console.log(`Created Owner User: ${ownerUser.email} (Password: password123)`);

  // 6. Setup active Subscription for the Business
  await prisma.subscription.create({
    data: {
      businessId: business.id,
      planType: SubscriptionPlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      billingCycleStart: new Date(),
      billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    },
  });
  console.log('Subscription configured.');

  // 7. Create mock Customers
  const customer1 = await prisma.customer.create({
    data: {
      businessId: business.id,
      fullName: 'Alice Johnson',
      mobileNumber: '+15550001',
      email: 'alice@example.com',
      company: 'Apex Corp',
      source: 'WhatsApp',
      status: 'Active',
      notes: 'Interested in enterprise support tiers.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      businessId: business.id,
      fullName: 'Bob Smith',
      mobileNumber: '+15550002',
      email: 'bob@example.com',
      company: 'Beta LLC',
      source: 'Direct',
      status: 'Active',
      notes: 'Referred by Dave.',
    },
  });
  console.log('Seeded mock customers.');

  // 8. Create mock Leads
  const lead1 = await prisma.lead.create({
    data: {
      businessId: business.id,
      customerId: customer1.id,
      title: 'Enterprise Software Licensing Deal',
      stage: LeadStage.NEW,
      assignedToUserId: ownerUser.id,
      estimatedValue: 15000.00,
      leadScore: 85,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      businessId: business.id,
      customerId: customer2.id,
      title: 'Consulting Contract',
      stage: LeadStage.CONTACTED,
      assignedToUserId: ownerUser.id,
      estimatedValue: 5000.00,
      leadScore: 60,
    },
  });
  console.log('Seeded mock leads.');

  // 9. Create mock Tasks
  await prisma.task.create({
    data: {
      businessId: business.id,
      assignedToUserId: ownerUser.id,
      title: 'Prepare project roadmap & proposal for Alice',
      description: 'Highlight the timeline and delivery schedules.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
  });

  await prisma.task.create({
    data: {
      businessId: business.id,
      assignedToUserId: ownerUser.id,
      title: 'Follow up call with Bob regarding invoice',
      description: 'Discuss discount option if they commit this week.',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
  });
  console.log('Seeded mock tasks.');

  // 10. Create mock templates
  await prisma.template.create({
    data: {
      businessId: business.id,
      name: 'welcome_template',
      category: TemplateCategory.WELCOME,
      bodyText: 'Hello {{1}}, thank you for reaching out to Acme Sales Corporation! We are excited to connect with you.',
      languageCode: 'en',
      metaStatus: 'APPROVED',
    },
  });

  await prisma.template.create({
    data: {
      businessId: business.id,
      name: 'followup_template',
      category: TemplateCategory.FOLLOW_UP,
      bodyText: 'Hi {{1}}, just checking in on the proposal we sent over. Let me know if you have any questions!',
      languageCode: 'en',
      metaStatus: 'APPROVED',
    },
  });
  console.log('Seeded templates.');

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
