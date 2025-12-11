// const BASE_URL = "https://jsonplaceholder.typicode.com";
// let postId = 1;
// async function getPost(id) {
//   try {
//     const response = await fetch(`${BASE_URL}/posts/${id}`);
//     if (!response.ok) {
//       throw new Error("Faild to fetch post");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// }

// 1. validation for switchers < >
// 2. localStorage
// 3. loading
// 4**. dynamic search {title, body}

const BASE_URL = "https://jsonplaceholder.typicode.com";
const STORAGE_KEY = "currentPostId";

let postId = 1;
let maxPostId = Infinity;
let isOffline = false; 

const root = document.getElementById("root");
const postContainer = document.getElementById("post-container");
const btnLeft = document.querySelector(".left");
const btnRight = document.querySelector(".right");
const loader = document.querySelector(".loader");

function showLoader() {
  loader.style.display = "inline-block";
}

function hideLoader() {
  loader.style.display = "none";
}

async function getPost(id) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "not_found" };
      }
      return { error: "server" }; 
    }

    return await response.json(); 
  } catch (error) {
    return { error: "network" }; 
  }
}

function renderPost(post) {
  postContainer.innerHTML = `
    <div class="post">
      <h2 class="post__title">${post.title}</h2>
      <p class="post__body">
        ${post.body.replace(/\n/g, "<br>")}
      </p>
    </div>
  `;
}

function updateButtons() {
  
  if (isOffline) {
    btnLeft.disabled = true;
    btnRight.disabled = true;
    return;
  }

  btnLeft.disabled = postId <= 1;
  btnRight.disabled = postId >= maxPostId;
}

async function loadPost(id) {
  showLoader();
  postContainer.innerHTML = "";

  const result = await getPost(id);

  hideLoader();

 
  if (result.error === "network") {
    isOffline = true;
    postContainer.innerHTML =
      "<p>No internet connection. Trying to load...</p>";
    updateButtons(); 
    return;
  }

  isOffline = false;

  if (result.error === "not_found") {
    alert("There is no next post.");
    maxPostId = postId; 
    updateButtons();
    return;
  }

  if (result.error === "server") {
    postContainer.innerHTML =
      "<p>Server error. Please try again later.</p>";
    updateButtons();
    return;
  }


  const post = result;
  postId = post.id;
  renderPost(post);
  updateButtons();
  localStorage.setItem(STORAGE_KEY, String(postId));
}

btnLeft.addEventListener("click", () => {
  if (postId > 1) {
    loadPost(postId - 1);
  }
});

btnRight.addEventListener("click", () => {
  loadPost(postId + 1);
});

document.addEventListener("DOMContentLoaded", () => {
  const savedId = parseInt(localStorage.getItem(STORAGE_KEY), 10);

  if (savedId && savedId > 0) {
    loadPost(savedId);
  } else {
    loadPost(1);
  }
});

