import { courses, catalogElements, catalogConfig } from "./data.js";

const PAGE_SIZE = catalogConfig.initialVisible ?? 9;

const state = {
  category: "All",
  query: "",
  visible: PAGE_SIZE,
};

const messages = {
  empty:
    "Nothing was found for your request. Please try a different filter or search query.",
  by: "by",
};

const normalize = (value) => value.trim().toLowerCase();

const formatPrice = (amount) =>
  typeof amount === "number" ? `$${amount}` : String(amount);

const categories = [
  "All",
  ...new Set(courses.map((course) => course.category).filter(Boolean)),
];

const categoryCounts = categories.reduce((acc, category) => {
  acc[category] =
    category === "All"
      ? courses.length
      : courses.filter((course) => course.category === category).length;
  return acc;
}, {});

const getFilteredCourses = () => {
  const query = normalize(state.query);
  const { category } = state;

  return courses.filter((course) => {
    const matchesCategory = category === "All" || course.category === category;
    const matchesQuery = normalize(course.title).includes(query);
    return matchesCategory && matchesQuery;
  });
};

const createCourseCard = (course) => {
  const { cardTemplate } = catalogElements;
  const root = cardTemplate.querySelector(".catalog-card")?.cloneNode(true);

  if (!root) return document.createDocumentFragment();

  const image = root.querySelector(".catalog-card__image");
  const tag = root.querySelector(".catalog-card__tag");
  const title = root.querySelector(".catalog-card__title");
  const price = root.querySelector(".catalog-card__price");
  const author = root.querySelector(".catalog-card__author");

  if (image) {
    image.src = course.image;
    image.alt = course.title;
  }

  if (tag) {
    tag.dataset.tag = course.category;
    tag.textContent = course.category;
  }

  if (title) {
    title.textContent = course.title;
  }

  if (price) {
    price.textContent = formatPrice(course.price);
  }

  if (author) {
    author.textContent = `${messages.by} ${course.mentor}`;
  }

  return root;
};

const updateLoadMore = (total) => {
  const { loadMore } = catalogElements;
  if (!loadMore) return;

  const hasMore = total > state.visible;
  loadMore.style.display = total && hasMore ? "flex" : "none";
  loadMore.disabled = !hasMore;
};

const renderCourses = () => {
  const { grid } = catalogElements;
  if (!grid) return;

  const filtered = getFilteredCourses();
  const visibleCourses = filtered.slice(0, state.visible);

  grid.innerHTML = "";

  if (!visibleCourses.length) {
    const empty = document.createElement("div");
    empty.className = "catalog__empty";
    empty.textContent = messages.empty;
    grid.append(empty);
    updateLoadMore(0);
    return;
  }

  const fragment = document.createDocumentFragment();
  visibleCourses.forEach((course) => fragment.append(createCourseCard(course)));

  grid.append(fragment);
  updateLoadMore(filtered.length);
};

const renderTabs = () => {
  const { tabs } = catalogElements;
  if (!tabs) return;

  const fragment = document.createDocumentFragment();

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tabs__button";
    button.setAttribute("role", "tab");
    button.dataset.value = category;

    const count = categoryCounts[category] ?? 0;
    const isActive = category === state.category;

    button.innerHTML = `${category} <span class="tabs__count">${count}</span>`;
    button.classList.toggle("tabs__button--active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute("aria-selected", String(isActive));

    fragment.append(button);
  });

  tabs.innerHTML = "";
  tabs.append(fragment);
};

const render = () => {
  renderTabs();
  renderCourses();
};

const handleTabClick = (event) => {
  const target = event.target.closest?.(".tabs__button");
  if (!target) return;

  const { value } = target.dataset;
  if (!value || value === state.category) return;

  state.category = value;
  state.visible = PAGE_SIZE;
  render();
};

const handleSearch = (event) => {
  const value = event.target?.value ?? "";
  state.query = value;
  state.visible = PAGE_SIZE;
  renderCourses();
};

const handleLoadMore = () => {
  state.visible += PAGE_SIZE;
  renderCourses();
};

const initCatalog = () => {
  const { tabs, grid, searchInput, loadMore, cardTemplate } = catalogElements;

  if (!tabs || !grid || !searchInput || !loadMore || !cardTemplate) return;

  render();

  tabs.addEventListener("click", handleTabClick);
  searchInput.addEventListener("input", handleSearch);
  loadMore.addEventListener("click", handleLoadMore);
};

export { initCatalog };
