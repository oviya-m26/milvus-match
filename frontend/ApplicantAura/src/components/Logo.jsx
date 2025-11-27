import Logo from "../assets/india_flag.svg"
const MilvusMatchLogo = ({ className }) => {
  return (
    <>
      <img
        src={Logo}
        alt="MilvusMatch, Job tracking web app"
        className={` ${className} object-cover mix-blend-multiply  `}
      />
    </>
  )
}

export default MilvusMatchLogo
