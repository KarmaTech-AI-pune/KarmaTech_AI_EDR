namespace EDR.Domain.Entities
{
    public class CreateAccount
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string PhoneNumber { get; set; }
        public string CompanyName { get; set; }
        public string CompanyAddress { get; set; }
        public string Subdomain { get; set; }
        public string SubscriptionPlan { get; set; }
    }
}

