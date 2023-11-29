using Microsoft.AspNetCore.Mvc;

namespace HappyBirthday.Controllers
{
    public class LoadingController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
