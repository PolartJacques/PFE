import { useNavigate } from "react-router-dom";

const Product = () => {
  const navigate = useNavigate()

  const goToHomePage = () => {
    navigate("/")
  }

  const handleClickMeButton = () => {
    const customEvent = new CustomEvent('myCustomEvent', { detail: { name: 'click me !' } })
    dispatchEvent(customEvent)
  }

  return (
    <div>
      <h1>Product page</h1>
      <button onClick={handleClickMeButton}>Click me</button>
      <button onClick={goToHomePage}>Go back</button>
    </div>
  )
}

export default Product