let seconds = 25 * 60;
let timer = null;
let round = 0;
let currentRecipeIndex = 0;

const timeEl = document.querySelector('#time');
const ingredientIcon = document.querySelector('#ingredientIcon');
const stageLabel = document.querySelector('#stageLabel');
const helperText = document.querySelector('#helperText');
const recipeName = document.querySelector('#recipeName');
const recipeSteps = document.querySelector('#recipeSteps');
const collection = document.querySelector('#collection');

const recipes = [
  {
    name: 'Chocolate Cloud Cake',
    treat: '🍰',
    ingredients: [
      { icon: '🥚', name: 'egg' },
      { icon: '🌾', name: 'flour' },
      { icon: '🍫', name: 'chocolate' },
      { icon: '🧈', name: 'butter' },
      { icon: '✨', name: 'sprinkles' }
    ]
  },
  {
    name: 'Strawberry Moon Pastry',
    treat: '🥐',
    ingredients: [
      { icon: '🍓', name: 'strawberries' },
      { icon: '🌾', name: 'flour' },
      { icon: '🧈', name: 'butter' },
      { icon: '🥛', name: 'cream' },
      { icon: '✨', name: 'sugar dust' }
    ]
  },
  {
    name: 'Tiny Star Cookie Box',
    treat: '🍪',
    ingredients: [
      { icon: '🥚', name: 'egg' },
      { icon: '🧈', name: 'butter' },
      { icon: '🍯', name: 'honey' },
      { icon: '🌰', name: 'vanilla' },
      { icon: '⭐', name: 'star sugar' }
    ]
  }
];

function getShop() {
  return JSON.parse(localStorage.getItem('focusBakeryShop') || '[]');
}

function saveShop(shop) {
  localStorage.setItem('focusBakeryShop', JSON.stringify(shop));
}

function renderTime() {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  timeEl.textContent = `${minutes}:${remainingSeconds}`;
}

function currentRecipe() {
  return recipes[currentRecipeIndex % recipes.length];
}

function renderRecipe() {
  const recipe = currentRecipe();
  recipeName.textContent = recipe.name;
  recipeSteps.innerHTML = '';

  recipe.ingredients.forEach((ingredient, index) => {
    const step = document.createElement('div');
    step.className = `step ${index < round ? 'done' : ''}`;
    step.innerHTML = `
      <span class="step-icon">${ingredient.icon}</span>
      <div>
        <strong>Round ${index + 1}</strong>
        <p>${index < round ? 'Collected' : 'Next'}: ${ingredient.name}</p>
      </div>
    `;
    recipeSteps.appendChild(step);
  });

  const nextIngredient = recipe.ingredients[Math.min(round, recipe.ingredients.length - 1)];
  ingredientIcon.textContent = round >= recipe.ingredients.length ? recipe.treat : nextIngredient.icon;
  stageLabel.textContent = round >= recipe.ingredients.length
    ? `${recipe.name} is ready!`
    : `Round ${round + 1} ingredient: ${nextIngredient.name}`;
}

function completeRound() {
  const recipe = currentRecipe();
  round += 1;

  if (round >= recipe.ingredients.length) {
    const shop = getShop();
    shop.push({
      id: Date.now(),
      name: recipe.name,
      icon: recipe.treat,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    });
    saveShop(shop);
    helperText.textContent = `You baked a ${recipe.name}! Your shop has a new treat.`;
    currentRecipeIndex += 1;
    round = 0;
  } else {
    helperText.textContent = 'Ingredient collected. One focus round closer to your next bakery treat.';
  }

  seconds = 25 * 60;
  renderTime();
  renderRecipe();
  renderCollection();
}

function renderCollection() {
  const shop = getShop();
  collection.innerHTML = '';

  if (shop.length === 0) {
    const empty = document.createElement('article');
    empty.className = 'treat-card';
    empty.innerHTML = '<div class="treat-icon">🧁</div><h3>No treats yet</h3><p>Complete five focus rounds to bake your first item.</p>';
    collection.appendChild(empty);
    return;
  }

  shop.slice().reverse().forEach((treat) => {
    const card = document.createElement('article');
    card.className = 'treat-card';
    card.innerHTML = `
      <div class="treat-icon">${treat.icon}</div>
      <h3>${treat.name}</h3>
      <p>Baked ${treat.date}</p>
    `;
    collection.appendChild(card);
  });
}

function startTimer() {
  if (timer) return;
  helperText.textContent = 'Focus round in progress. Your bakery is warming up.';
  timer = setInterval(() => {
    if (seconds > 0) {
      seconds -= 1;
      renderTime();
    } else {
      clearInterval(timer);
      timer = null;
      completeRound();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
  helperText.textContent = 'Paused. Your ingredients are still waiting for you.';
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  seconds = 25 * 60;
  renderTime();
  helperText.textContent = 'Timer reset. Start again when you are ready.';
}

document.querySelector('#start').addEventListener('click', startTimer);
document.querySelector('#pause').addEventListener('click', pauseTimer);
document.querySelector('#reset').addEventListener('click', resetTimer);
document.querySelector('#complete').addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
  completeRound();
});

document.querySelector('#addReflection').addEventListener('click', () => {
  const note = document.querySelector('#focusNote').value.trim();
  const reflection = document.querySelector('#reflectionText');

  if (!note) {
    reflection.textContent = 'Write one tiny win first. Your bakery buddy wants to turn it into a warm note.';
    return;
  }

  reflection.textContent = `Bakery note: you added care and focus to the recipe by working on “${note}” — small batches still build a full shop.`;
});

document.querySelector('#clearShop').addEventListener('click', () => {
  localStorage.removeItem('focusBakeryShop');
  renderCollection();
});

renderTime();
renderRecipe();
renderCollection();
