// Elementos do DOM
const roomsContainer = document.getElementById("rooms-container");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("room-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mainNav = document.getElementById("main-nav");
const header = document.getElementById("header");
const navLinks = document.querySelectorAll("nav a");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");
const hackSearchInput = document.getElementById("hack-search");
const searchSuggestions = document.getElementById("search-suggestions");
const searchIcon = document.querySelector(".search-icon");
const clearIcon = document.querySelector(".clear-icon");

// Variáveis de estado
let scrollPosition = 0;
let currentPage = 1;
const cardsPerPage = 9;
let currentSuggestions = [];
let pesquisaConfirmada = false;
