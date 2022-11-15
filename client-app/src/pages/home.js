import { useNavigate } from "react-router-dom"

const Home = () => {
  const navigate = useNavigate()

  const goToPage2 = () => {
    navigate("/product")
  }

  return (
    <div>
      <h1>Client app</h1>
      <button onClick={goToPage2}>go to product page</button>
    </div>
  )
}

export default Home