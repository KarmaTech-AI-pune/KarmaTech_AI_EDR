export const subscriptionPlans = [
  {
    planId: 1,
    planName: "Starter Plan",
    features: [
      { name: "manpower", enabled: true },
      { name: "odc", enabled: true },
      { name: "job-start", enabled: true },
      { name: "input-register", enabled: false },
      { name: "correspondence", enabled: false },
      { name: "check&review", enabled: false },
      { name: "change-control", enabled: false },
      { name: "progress-review", enabled: false },
      { name: "closure", enabled: false },
      { name: "monthly-reports", enabled: false },
    ],
  },
  {
    planId: 2,
    planName: "Pro Plan",
    features: [
      { name: "manpower", enabled: true },
      { name: "odc", enabled: false },
      { name: "job-start", enabled: true },
      { name: "input-register", enabled: true },
      { name: "correspondence", enabled: true },
      { name: "check&review", enabled: true },
      { name: "change-control", enabled: true },
      { name: "progress-review", enabled: false },
      { name: "closure", enabled: false },
      { name: "monthly-reports", enabled: false },
    ],
  },
  {
    planId: 3,
    planName: "Business Plan",
    features: [
      { name: "manpower", enabled: true },
      { name: "odc", enabled: true },
      { name: "job-start", enabled: true },
      { name: "input-register", enabled: true },
      { name: "correspondence", enabled: true },
      { name: "check&review", enabled: true },
      { name: "change-control", enabled: true },
      { name: "progress-review", enabled: true },
      { name: "closure", enabled: true },
      { name: "monthly-reports", enabled: true },
    ],
  },
];

export const users = [
  { userId: 1, name: "Alice", email: "alice@example.com", planId: 1 },
  { userId: 2, name: "Bob", email: "bob@example.com", planId: 2 },
  { userId: 3, name: "Charlie", email: "charlie@example.com", planId: 3 },
];

/**
 * Simulates fetching user's plan by userId
 * @param {number} userId 
 * @returns {object|null} user object with plan info or null if not found
 */
export function getUserPlan(userId:number) {
  const user = users.find(u => u.userId === userId);
  if (!user) return null;

  const plan = subscriptionPlans.find(p => p.planId === user.planId);
  if (!plan) return null;

  // Return payload similar to API
  return {
    planId: plan.planId,
    planName: plan.planName,
    features: plan.features,
  };
}