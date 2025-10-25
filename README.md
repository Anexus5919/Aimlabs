# 🎯 Aimlabs Clone: Three.js Aim Trainer

## 🚀 Project Overview

Welcome to **Aimlabs-Threejs**! This is a simple, browser-based 3D aim trainer built with **Three.js** and bundled with **Vite**. Sharpen your mouse control and reaction time by clicking on the red targets that spawn in the 3D environment. The game features a dedicated **Practice Mode** with customizable difficulty and duration.

***

## ✨ Key Features

This aim trainer is equipped with essential features for a focused practice session:

* **Difficulty Selection**: Choose between **Easy**, **Medium**, and **Hard** modes.
    * **Easy**: Targets appear closer, in a smaller area, and are visually larger.
    * **Medium/Hard**: Targets appear further away, in a larger area, offering a greater challenge.
* **Time-Based Sessions**: Select a predefined duration (1, 2, or 3 minutes) or set a **Custom** time for your practice.
* **Real-time Score & Timer**: Track your hits and remaining time directly on the screen.
* **Detailed Post-Session Statistics**: After the timer runs out, a modal displays key performance metrics:
    * **Final Score**
    * **Accuracy (%)**
    * **Missed Shots**
    * **Shots Per Minute**
    * **Average Time Between Hits**
* **Minimalist 3D Environment**: The game features a black background and a red target to minimize distractions and focus purely on aiming mechanics.

***

## 🛠️ Installation and Setup

To get this project running locally, you'll need **Node.js** installed on your system.

### Prerequisites

* **Node.js** (required for `npm` and `vite`)

### Running Locally

1.  **Clone the Repository** (assuming the project is hosted in a repository):
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install Dependencies**: Use `npm install` (or `npm i`) to install the required packages, including `three` and `vite`.
    ```bash
    npm install
    ```

3.  **Start the Development Server**: Use the `dev` script defined in `package.json` to launch the development server powered by Vite.
    ```bash
    npm run dev
    ```

4.  **Access the Game**: Open your browser and navigate to the local address provided by the Vite server (usually `http://localhost:5173/`).

***

## 🎮 Gameplay Instructions

1.  **Start Screen**: The application begins with the **Practice Mode UI** panel.
2.  **Select Difficulty**: Choose one of the three difficulty buttons (**Easy**, **Medium**, or **Hard**).
3.  **Select Duration**: Once a difficulty is selected, the duration options will appear. Click on a time button (e.g., **1 Minute**) or set a **Custom** time to begin the session.
4.  **Aim and Shoot**: A red sphere will appear in the 3D world. Use your mouse to aim the **crosshair** at the target and **click** to shoot.
5.  **Target Behavior**: A new target only spawns immediately after the previous one is successfully hit.
6.  **Session End**: The session automatically ends when the timer reaches zero, and the **Statistics Modal** will be displayed.
7.  **Reset**: The **Reset Score** button in the top-right corner allows you to end the current session and return to the main setup screen.

***

## 💻 Technologies Used

* **Three.js**: Used for creating and rendering the 3D environment and game objects.
* **JavaScript (ES Modules)**: Powers the entire game logic, click detection, scoring, and UI management.
* **Vite**: The build tool and development server.
* **HTML/CSS**: For the game canvas and the overlay UI elements (panels, buttons, and statistics modal).
