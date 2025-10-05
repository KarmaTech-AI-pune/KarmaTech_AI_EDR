export interface Feature {
  name: string;
  enabled: boolean;
}

export interface SubscriptionData {
  planId: number;
  planName: string;
  features: Feature[];
}