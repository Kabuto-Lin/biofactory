namespace Sinon_Factory.Models.ViewModel
{
    public class TokenViewModel<T>
    {
        public long exp { get; set; }
        public T data { get; set; }
        public int expire { get; set; }
    }
}
