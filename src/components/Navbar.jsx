import { Link } from "react-router-dom"
import { Logo } from "../components"

const Navbar = () => {
  return (
    <nav className="container mx-auto my-4 flex items-center justify-between py-2 px-4 bg-white border-t-4" style={{ borderColor: "#FF9933" }}>
      <div className=" flex items-center space-x-2 ">
        <Logo className="h-8 " />
        <h2 className="text-center text-3xl font-bold text-black">MilvusMatch</h2>
      </div>
      <div className=" hidden md:flex md:space-x-8  ">
        <Link
          to="/login"
          className=" rounded-md px-4 py-3 font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className=" rounded-md px-4 py-3 text-xs font-medium text-white transition-colors duration-200 md:text-sm "
          style={{ backgroundColor: "#138808" }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
