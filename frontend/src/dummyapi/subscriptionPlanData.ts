export const subscriptionPlans = [
  {
    planId: 1,
    planName: "Starter Plan",
    features: [
      { name: "feature1", enabled: true },
      { name: "feature2", enabled: true },
      { name: "feature3", enabled: true },
      { name: "feature4", enabled: false },
      { name: "feature5", enabled: false },
      { name: "feature6", enabled: false },
      { name: "feature7", enabled: false },
      { name: "feature8", enabled: false },
      { name: "feature9", enabled: false },
      { name: "feature10", enabled: false },
    ],
  },
  {
    planId: 2,
    planName: "Pro Plan",
    features: [
      { name: "feature1", enabled: true },
      { name: "feature2", enabled: true },
      { name: "feature3", enabled: true },
      { name: "feature4", enabled: true },
      { name: "feature5", enabled: true },
      { name: "feature6", enabled: true },
      { name: "feature7", enabled: false },
      { name: "feature8", enabled: false },
      { name: "feature9", enabled: false },
      { name: "feature10", enabled: false },
    ],
  },
  {
    planId: 3,
    planName: "Business Plan",
    features: [
      { name: "feature1", enabled: true },
      { name: "feature2", enabled: true },
      { name: "feature3", enabled: true },
      { name: "feature4", enabled: true },
      { name: "feature5", enabled: true },
      { name: "feature6", enabled: true },
      { name: "feature7", enabled: true },
      { name: "feature8", enabled: true },
      { name: "feature9", enabled: true },
      { name: "feature10", enabled: true },
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
export function getUserPlan(userId) {
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