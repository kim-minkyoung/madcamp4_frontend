"use client";

import React, { useEffect, useRef, useState } from "react";
import ingredients from "./ingredient.json";
import recipes from "./recipe.json";
import "./styles/potion.css";
import Dropdown from "../../components/Dropdown";
import Image from "../../components/Image";
import { updateDormPoints } from "../../services/DormsService";
import classNames from 'classnames';

interface Recipe {
  name: string;
  ingredients: string[];
  effect: string;
  target: string;
  score: string;
}

const Potion: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedPotion, setSelectedPotion] = useState<{
    name: string;
    ingredients: string[];
  } | null>(null);
  const [selectedDetailPotion, setSelectedDetailPotion] = useState<{
    name: string;
    effect: string;
    stock: number;
  } | null>(null);
  const [showPotionCase, setShowPotionCase] = useState<boolean>(false);
  const [createdPotions, setCreatedPotions] = useState<
    { name: string; imageUrl: string; stock: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDorm, setSelectedDorm] = useState<string>(""); // 선택된 기숙사를 저장할 상태
  const [showDormSelection, setShowDormSelection] = useState(false); // 기숙사 선택 UI를 보여줄지 여부를 저장할 상태
  const [foundRecipe, setFoundRecipe] = useState<Recipe | null>(null); // foundRecipe를 상태로 저장
  const dorms = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]; // 예시 기숙사 목록
  const dormHoverColors: { [key: string]: string } = {
    Gryffindor: 'hover:text-red-700',
    Hufflepuff: 'hover:text-yellow-700',
    Ravenclaw: 'hover:text-blue-800',
    Slytherin: 'hover:text-green-700',
  };

  // useEffect(() => {
  //   const fetchPotions = async () => {
  //     try {
  //       // const dormId = parseInt(localStorage.getItem("dormId") ?? "");
  //       // const response = await fetch(
  //       //   `https://hogwart.paulupa.com/api/potions/${dormId}`
  //       // ); // Replace '1' with the appropriate dormId
  //       // const data = await response.json();

  //       // const potionCountMap = data.reduce(
  //       //   (
  //       //     acc: { [x: string]: any },
  //       //     potion: { potion_name: string | number }
  //       //   ) => {
  //       //     acc[potion.potion_name] = (acc[potion.potion_name] || 0) + 1;
  //       //     return acc;
  //       //   },
  //       //   {}
  //       // );

  //       // Convert the map to an array of objects with name, imageUrl, and stock
  //       // const potions = Object.entries(potionCountMap).map(
  //       //   ([potion_name, stock]) => ({
  //       //     name: potion_name,
  //       //     imageUrl: `https://syeongkim.github.io/madcamp_week4_front/images/${potion_name}.webp`,
  //       //     stock: Number(stock), // Cast stock to number
  //       //   })
  //       // );

        
  //       setCreatedPotions(potions);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching potions:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchPotions();
  // }, []);

  const readypotions = [{
    name: 'Polyjuice Potion',
    imageUrl: 'https://syeongkim.github.io/madcamp_week4_front/images/Polyjuice Potion.webp',
    stock: 2
  },
  {
    name: 'Skele-Gro',
    imageUrl: 'https://syeongkim.github.io/madcamp_week4_front/images/Skele-Gro.webp',
    stock: 1
  }]

  const shelfPositions = [
    { top: "10%", left: "10%" },
    { top: "10%", left: "27%" },
    { top: "10%", left: "45%" },
    { top: "10%", left: "62%" },
    { top: "10%", left: "80%" },
    { top: "50%", left: "10%" },
    { top: "50%", left: "27%" },
    { top: "50%", left: "45%" },
    { top: "50%", left: "62%" },
    { top: "50%", left: "80%" },
    { top: "90%", left: "10%" },
    { top: "90%", left: "27%" },
    { top: "90%", left: "45%" },
    { top: "90%", left: "62%" },
    { top: "90%", left: "80%" },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.classList.add("scrolling");

    const startX = e.pageX - container.offsetLeft;
    const scrollLeft = container.scrollLeft;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // 스크롤 속도 조정
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      container.classList.remove("scrolling");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleIngredientClick = (ingredient: string) => {
    setSelectedIngredients((prevSelected) => {
      if (prevSelected.includes(ingredient)) {
        return prevSelected.filter((item) => item !== ingredient);
      } else {
        return [...prevSelected, ingredient];
      }
    });
  };

  const checkRecipe = async () => {
    const recipe = recipes.find((recipe) =>
      recipe.ingredients.every((ingredient) =>
        selectedIngredients.includes(ingredient)
      )
    );

    if (recipe) {
      setFoundRecipe(recipe);
      setResult(`${recipe.name} is created \n ${recipe.effect}`);
      const dormId = localStorage.getItem("dormId");
      try {
        const response = await fetch(
          `https://hogwart.paulupa.com/api/potions/${dormId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ potionName: recipe.name }),
          }
        );
        const data = await response.json();
        console.log("Potion added:", data);

        // Update the created potions state
        setCreatedPotions((prevPotions) => {
          const potionExists = prevPotions.find(
            (potion) => potion.name === recipe.name
          );
          if (potionExists) {
            return prevPotions.map((potion) =>
              potion.name === recipe.name
                ? { ...potion, stock: potion.stock + 1 }
                : potion
            );
          } else {
            return [
              ...prevPotions,
              {
                name: recipe.name,
                imageUrl: `https://syeongkim.github.io/madcamp_week4_front/images/${recipe.name}.webp`,
                stock: 1,
              },
            ];
          }
        });
      } catch (error) {
        console.error("Error adding potion:", error);
      }
    } else {
      setResult("Wrong combination, try again!");
    }
  };

  const showEffect = (potionName: string) => {
    setShowDetailModal(false);
    const myDormId = localStorage.getItem("dormId") ?? "";
    const potion = recipes.find((recipe) => recipe.name === potionName);

    try {
      if (potion && potion.target === "other") {
        console.log("here");
        setShowDormSelection(true); // 기숙사 선택 UI를 보여줍니다.
      } else {
        if (potion && potion.score.includes("*")) {
          updateDormPoints(myDormId, parseFloat(potion.score.replace("*", "")), "multiply");
        } else {
          if (potion) {
            updateDormPoints(myDormId, parseInt(potion.score.replace("+", "")), "add");

          }
        }
      }
      setSelectedIngredients([]);
      setResult(null);
    } catch (e) {
      console.error("Error updating points:", e);
    }

  }

  // 기숙사 선택 후 효과를 적용하는 함수
  const applyEffectToDorm = async (dorm: string) => {
    const dormMapping: { [key: string]: number } = {
      Gryffindor: 1,
      Hufflepuff: 2,
      Ravenclaw: 3,
      Slytherin: 4,
    };

    const dormId = dormMapping[dorm];
    try {
      if (selectedDetailPotion) {
        const potion = recipes.find((recipe) => recipe.name === selectedDetailPotion.name);
        // 선택한 기숙사에 효과를 적용하는 로직 추가
        if (potion && potion.score.includes("*")) {
          updateDormPoints(dormId.toString(), parseFloat(potion.score.replace("*", "")), "multiply");
        } else {
          if (potion) {
            updateDormPoints(dormId.toString(), parseInt(potion.score.replace("+", "")), "add");
          }

        }
        setShowDormSelection(false); // 기숙사 선택 UI를 숨깁니다.
      }
    } catch (e) {
      console.error("Error applying effect to dorm:", e);
    }
  };

  const resetSelection = () => {
    setSelectedIngredients([]);
    setResult(null);
  };

  const handlePotionClick = async (recipe: {
    name: string;
    ingredients: string[];
  }) => {
    const dormId = localStorage.getItem("dormId");
    if (dormId) {
      console.log("minus credit")
      // await updateDormPoints(dormId, -10, "add");
    }
    setSelectedPotion(recipe);
    setShowNewModal(true);
    setShowDropdown(false);
    setTimeout(() => {
      setShowNewModal(false);
      setSelectedPotion(null);
    }, 5000);
  };

  const handlePotionImageClick = (potionName: string) => {
    const recipe = recipes.find((r) => r.name === potionName);
    const potion = createdPotions.find((p) => p.name === potionName);
    if (recipe && potion) {
      setSelectedDetailPotion({
        name: recipe.name,
        effect: recipe.effect,
        stock: potion.stock,
      });
      setShowDetailModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-makepotions-background bg-cover bg-center flex relative">
      <audio
        src="https://syeongkim.github.io/madcamp_week4_front/musics/02_Harry's_Wondrous_World.mp3"
        autoPlay
        loop
      />
      <div
        className="ingredients-container overflow-y-auto"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
      >
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className={`p-1 rounded-lg shadow-lg cursor-pointer relative mb-2 flex flex-col items-center justify-center ${
              selectedIngredients.includes(ingredient.name)
                ? "selected-ingredient"
                : ""
            }`}
            onClick={() => handleIngredientClick(ingredient.name)}
          >
            <div className="w-20 h-20 relative overflow-hidden rounded-md flex items-center justify-center">
              <Image
                src={ingredient.imageUrl}
                alt={ingredient.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {selectedIngredients.includes(ingredient.name) && (
                <>
                  <div className="absolute inset-0 bg-black opacity-50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </>
              )}
            </div>
            <h2 className="text-xxs font-bold text-white font-Animales text-center mt-2">
              {ingredient.name}
            </h2>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="submit-button-container">
          <button
            className="submit-button mt-2 px-4 py-2 text-white rounded-lg font-Harry"
            onClick={checkRecipe}
          >
            Submit
          </button>
        </div>
        {result && (
          <div className="result-modal text-center mt-4 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white font-Animales mb-4">
              {result}
            </h2>
            {result && (
              <button
                className="mt-2 px-4 py-2 text-white rounded-lg font-Animales block"
                onClick={resetSelection}
              >
                Try Again
              </button>
            )}
            {/* {result.toLowerCase().includes("wrong") && (
              <button
                className="mt-2 px-4 py-2 text-white rounded-lg font-Animales block"
                onClick={resetSelection}
              >
                Try Again
              </button>
            )} ? (
            <button
              className="mt-2 px-4 py-2 text-white rounded-lg font-Animales block"
              onClick={showEffect}
            >
              Show Effect
            </button>
            ) */}
          </div>
        )}

      </div>
      <div className="fixed top-0 right-0 p-4 flex flex-col">
        <button
          className="potion-black-market-button"
          onClick={() => setShowModal(true)}
        ></button>
        <text className="mt-3 font-Animales text-xs text-white text-center">
          secret hint
        </text>
      </div>
      <div className="fixed top-32 right-0 p-4 flex flex-col">
        <button onClick={() => setShowPotionCase(true)}>
          <Image
            src="https://syeongkim.github.io/madcamp_week4_front/images/potion_case.jpg"
            alt="potion"
            className="w-20 h-20 object-cover object-center"
          />
          <p className="font-Animales text-white text-xs mt-3">Our Potions</p>
        </button>
      </div>

      {showModal && (
        <div
          className="modal font-Harry text-white text-center"
          onClick={() => setShowModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <h2 className="text-4xl">
              Select the potion for which you want to check the ingredients
            </h2>
            <h4 className="text-2xl">You must pay 10 points to get hint</h4>
            <div className="mt-4">
              <div className="relative inline-block text-left">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-white rounded-lg text-xl"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Show Potions List
                </button>
                {showDropdown && (
                  <div className="origin-top-right no-scrollbar absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      {recipes.map((recipe, index) => (
                        <Dropdown
                          key={index}
                          onClick={() => handlePotionClick(recipe)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          {recipe.name}
                        </Dropdown>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewModal && selectedPotion && (
        <div
          className="new-modal font-Harry text-white text-center"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="new-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              onClick={() => setShowNewModal(false)}
              className="new-modal-close text-black"
            >
              &times;
            </span>
            <h2 className="text-black text-6xl mb-4">{selectedPotion.name}</h2>
            <p className="text-black text-4xl">
              {selectedPotion.ingredients.join(", ")}
            </p>
          </div>
        </div>
      )}

      {showPotionCase && (
        <div
          className="potion-case-modal fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
          onClick={() => setShowPotionCase(false)}
        >
          <div
            className="p-8 rounded-lg max-w-5xl w-full h-full relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: `url(https://syeongkim.github.io/madcamp_week4_front/images/potion_case_background.jpg)`,
              backgroundSize: "contain", // Use contain to ensure the whole image is visible
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="potion-case-content w-full h-full relative">
              {/* <h2 className="fixed-title text-4xl text-white font-Harry">Potion Case</h2> */}

              {/* Positioning the potions */}
              {readypotions.map((potion, index) => (
                  <div
                    key={index}
                    className="absolute flex flex-col items-center justify-center w-24 h-24"
                    style={{
                      top: `${shelfPositions[index].top}`, // Adjust these positions based on the image
                      left: `${shelfPositions[index].left}`, // Adjust these positions based on the image
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center", // Ensure text is centered
                    }}
                    onClick={() => handlePotionImageClick(potion.name)}
                  >
                    <Image
                      src={potion.imageUrl}
                      alt={potion.name}
                      className="w-24 h-24 object-cover mb-2 mt-2"
                    />
                    <p className="text-white text-xs font-Animales text-center">
                      {potion.name}
                    </p>
                  </div>
                ))}

              <button
                onClick={() => setShowPotionCase(false)}
                className="absolute top-2 right-2 text-black text-2xl font-bold"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailModal && selectedDetailPotion && (
        <div
          className="detail-modal font-Harry text-white text-center"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="detail-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              onClick={() => setShowDetailModal(false)}
              className="detail-modal-close text-black"
            >
              &times;
            </span>
            <h2 className="text-black text-6xl mb-4">
              {selectedDetailPotion.name}
            </h2>
            <p className="text-black text-4xl mb-2">
              {selectedDetailPotion.effect}
            </p>
            <p className="text-black text-2xl">
              Stock: {selectedDetailPotion.stock}
            </p>
            <button className="text-black" onClick={() => showEffect(selectedDetailPotion.name)}>
              Apply Effect
            </button>
          </div>
        </div>
      )}

      {showDormSelection && (
        <div className="new-modal fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="text-white p-6 rounded-lg shadow-lg text-center font-Animales">
            <h3 className="text-2xl mb-4">Select a dorm to apply the effect</h3>
            <div className="grid grid-cols-2 gap-4">
              {dorms.map((dorm) => (
                <button
                  key={dorm}
                  onClick={() => applyEffectToDorm(dorm)}
                  className={classNames(
                    'text-white font-bold py-2 px-4 rounded transition duration-200 transform hover:scale-105',
                    dormHoverColors[dorm]
                  )}
                >
                  {dorm}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Potion;
