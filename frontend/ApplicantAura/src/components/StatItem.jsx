const StatItem = ({ title, icon, count, color, bcg }) => {
  return (
    <article className=" rounded-2xl bg-white border border-gray-200 text-black shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className=" flex flex-row items-center justify-center space-x-6 py-4 px-5 ">
        <p className="  rounded-lg outline-dashed outline-2  outline-offset-4 outline-gray-300 transition-all duration-300 ease-in hover:scale-110  ">
          {icon}
        </p>
        <p className="w-1/2 font-medium capitalize text-gray-600 xl:text-xl  ">
          {" "}
          {title}
        </p>
        <p className="text-5xl font-bold text-gray-300 xl:text-7xl "> {count} </p>
      </div>
    </article>
  )
}

export default StatItem
