namespace Schedule.Application.Exceptions
{
    public class AlreadyExistException : Exception
    {
        private const string DefaultMessage = "The requested resource already exists.";

        public AlreadyExistException(): base(DefaultMessage) { }
        public AlreadyExistException(string message) : base(message) { }
        public AlreadyExistException(string message,  Exception innerException) : base(message, innerException) { }
    }
}
