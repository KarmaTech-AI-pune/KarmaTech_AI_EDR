using System;

namespace EDR.Application.DTOs
{
    public class CorrespondenceInwardDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string IncomingLetterNo { get; set; }
        public DateTime LetterDate { get; set; }
        public string NjsInwardNo { get; set; }
        public DateTime ReceiptDate { get; set; }
        public string From { get; set; }
        public string Subject { get; set; }
        public string AttachmentDetails { get; set; }
        public string ActionTaken { get; set; }
        public string StoragePath { get; set; }
        public string Remarks { get; set; }
        public DateTime? RepliedDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}

