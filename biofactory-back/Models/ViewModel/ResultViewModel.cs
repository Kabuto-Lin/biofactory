namespace Sinon_Factory.Models.ViewModel
{
    public class ResultViewModel<T>
    {

        public bool isSuccess { get; set; }
        public string message { get; set; }
        public T Result { get; set; }

        public ResultViewModel()
        {

        }

        public ResultViewModel(bool isSuccess, string message, T Result)
        {
            this.isSuccess = isSuccess;
            this.message = message;
            this.Result = Result;
        }
    }
}
