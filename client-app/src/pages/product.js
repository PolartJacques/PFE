import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Product = () => {
  const [doesDisplaySecretButton, setDoesDisplaySecretButton] = useState(false)
  const navigate = useNavigate()

  const goToHomePage = () => {
    navigate("/")
  }

  const handleClickMeButton = () => {
    setDoesDisplaySecretButton(prev => !prev)
  }

  return (
    <div>
      <h1>Product page</h1>
      <button onClick={handleClickMeButton}>Click me</button>
      <button onClick={goToHomePage}>Go back</button>
      {doesDisplaySecretButton && (
        <div>
          <button>secret button</button>
          <button>useless button</button>
          <p>cool nah ?</p>
        </div>
      )}
    </div>
  )
}

export default Product