export interface Feature {
  name: string;
  enabled: boolean;
}

export interface SubscriptionData {
  features: Feature[];
}