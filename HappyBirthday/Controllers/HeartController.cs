using Microsoft.AspNetCore.Mvc;

namespace HappyBirthday.Controllers
{
    public class HeartController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
