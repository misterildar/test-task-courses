import { courses, catalogElements, catalogConfig } from "./data.js";

const categories = [
  "All",
  ...new Set(courses.map((course) => course.category)),
];

const state = {
  category: "All",
  query: "",
  visible: catalogConfig.initialVisible,
};

function formatPrice(amount) {
  return `$${amount}`;
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function getFilteredCourses() {
  const query = normalize(state.query);

  return courses.filter((course) => {
    const matchesCategory =
      state.category === "All" || course.category === state.category;
    const matchesQuery = normalize(course.title).includes(query);
    return matchesCategory && matchesQuery;
  });
}

function updateLoadMore(total) {
  const { loadMore } = catalogElements;
  if (!loadMore) return;

  if (total === 0) {
    loadMore.style.display = "none";
    return;
  }

  if (total > state.visible) {
    loadMore.style.display = "inline-flex";
    loadMore.disabled = false;
    loadMore.textContent = "Load more";
  } else {
    loadMore.style.display = "none";
  }
}

function createCourseCard(course) {
  const { title, category, price, mentor, image } = course;

  const cardElement = catalogElements.cardTemplate
    .querySelector(".catalog-card")
    .cloneNode(true);

  const cardImage = cardElement.querySelector(".catalog-card__image");
  const cardTag = cardElement.querySelector(".catalog-card__tag");
  const cardTitle = cardElement.querySelector(".catalog-card__title");
  const cardPrice = cardElement.querySelector(".catalog-card__price");
  const cardAuthor = cardElement.querySelector(".catalog-card__author");

  cardImage.src = image;
  cardImage.alt = title;
  cardTag.dataset.tag = category;
  cardTag.textContent = category;
  cardTitle.textContent = title;
  cardPrice.textContent = formatPrice(price);
  cardAuthor.textContent = `by ${mentor}`;

  return cardElement;
}

function renderCourses() {
  const { grid } = catalogElements;
  const filtered = getFilteredCourses();
  const visibleCourses = filtered.slice(0, state.visible);

  grid.innerHTML = "";

  if (visibleCourses.length === 0) {
    const empty = document.createElement("div");
    empty.className = "catalog__empty";
    empty.textContent =
      "По вашему запросу ничего не найдено. Попробуйте другой фильтр или запрос.";
    grid.append(empty);
    updateLoadMore(0);
    return;
  }

  visibleCourses.forEach((course) => {
    const card = createCourseCard(course);
    grid.append(card);
  });
  updateLoadMore(filtered.length);
}

function renderTabs() {
  const { tabs } = catalogElements;
  const fragment = document.createDocumentFragment();

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tabs__button";
    button.dataset.value = category;
    button.textContent = category;

    if (category === state.category) {
      button.classList.add("tabs__button--active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }

    fragment.append(button);
  });

  tabs.innerHTML = "";
  tabs.append(fragment);
}

function handleTabClick(event) {
  if (!event.target.matches(".tabs__button")) {
    return;
  }

  const { value } = event.target.dataset;
  if (!value || value === state.category) {
    return;
  }

  state.category = value;
  state.visible = catalogConfig.initialVisible;
  renderTabs();
  renderCourses();
}

function handleSearch(event) {
  state.query = event.target.value;
  state.visible = catalogConfig.initialVisible;
  renderCourses();
}

function handleLoadMore() {
  state.visible += 3;
  renderCourses();
}

function initCatalog() {
  const { tabs, grid, searchInput, loadMore, cardTemplate } = catalogElements;

  if (!tabs || !grid || !searchInput || !loadMore || !cardTemplate) {
    return;
  }

  renderTabs();
  renderCourses();

  tabs.addEventListener("click", handleTabClick);
  searchInput.addEventListener("input", handleSearch);
  loadMore.addEventListener("click", handleLoadMore);
}

export { initCatalog };
