using System.ComponentModel.DataAnnotations;

namespace NJS.Application.DTOs
{
    public class CreateAccountDto
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string EmailAddress { get; set; }

        public string PhoneNumber { get; set; }

        public string CompanyName { get; set; }

        public string CompanyAddress { get; set; }

        public string Subdomain { get; set; }

        public string SubscriptionPlan { get; set; }
    }
}
