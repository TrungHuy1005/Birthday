using Microsoft.AspNetCore.Mvc;

namespace HappyBirthday.Controllers
{
    public class PosterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
