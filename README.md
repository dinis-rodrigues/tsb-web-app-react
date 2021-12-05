<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/dinis-rodrigues/tsb-web-app-react">
    <img src="public/assets/images/readMeImages/readMeFront.png" alt="Logo" width="250">
  </a>

  <h3 align="center">Project Management Web Application</h3>

  <p align="center">
    An open-source project management application built with ReactJS and Firebase
    <br />
    <a href="https://github.com/dinis-rodrigues/tsb-web-app-react" target="_blank"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://web.ist.utl.pt/~ist179089/projects/tsbAppDemo/" target="_blank">View Demo</a>
    ·
    <a href="https://github.com/dinis-rodrigues/tsb-web-app-react/issues" target="_blank">Report Bug</a>
    ·
    <a href="https://github.com/dinis-rodrigues/tsb-web-app-react/issues" target="_blank">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#firebase-setup">Firebase Setup</a></li>
        <li><a href="#php-setup">PHP Setup</a></li>
      </ul>
    </li>
    <li><a href="#deploy">Deploy</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

There are many great Project Management Applications available on the web,
however, most require a premium subscription in order to have any sort of
advanced functionality. Additionally I didn't find one that really suited my
needs so I created this enhanced and custom one. Anyone can use this as a
template and migrate their own projects to this.

Of course, this template won't serve all projects since your needs may be
different. So I'll be adding more features in the near future. You may also
suggest changes by forking this repo and creating a pull request or opening an issue.

### Features

- User Authentication
- User Profiles
- Calendar and Events
- Task Assignment
- Forum
- Budget and Bill of Materials
- Finances and Cash Flow
- Notifications
- User Management
- Department Management

### Built With

Front-end of the application was developed with:

- [TypeScript](https://www.typescriptlang.org)
- [ReactJS](https://reactjs.org)

For this specific project, NodeJS related back-ends were not possible to
implement, only PHP was available. Since I didn't want to develop a PHP
backend, the data infrastructure is built with Firebase Realtime Database,
which is more than enough for the necessary queries and handles all user authentication!

- [Firebase](https://firebase.google.com)

However, for the user profile picture uploads, a very simple PHP API was
implemented to store the images in the server.

<!-- GETTING STARTED -->

## Getting Started

This project follows the `create-react-app` file structure. If you would like to set up this project up and running locally for yourself, follow these steps.

### Prerequisites

Clone the repository

```sh
git clone https://github.com/dinis-rodrigues/tsb-web-app-react.git
```

Install all project dependencies

```sh
npm install
```

### Firebase Setup

If you would like to setup your own database, it only takes 2 min.

1. Create a Firebase Project [here](https://firebase.google.com)
2. Setup User and Email authentication
3. Setup Realtime Database
4. Import the database template from

```sh
src/config/dbTemplate.json
```

5. Import the database rules from

```sh
src/config/dbRules.json
```

6. Go to Project Settings and get the API key, should look like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSyAHPrWvVr1El3NkJd3C0gbZbiTl_weCTlE",
  authDomain: "tsb-aplication.firebaseapp.com",
  databaseURL: "https://tsb-aplication.firebaseio.com",
  projectId: "tsb-aplication",
  storageBucket: "tsb-aplication.appspot.com",
  messagingSenderId: "124968779478",
  appId: "1:124968779478:web:0a2c6266560c594a779377",
  measurementId: "G-0Z77DRSCH6",
};
```

7. Copy and replace the API configuration in

```sh
src/config/firebase.tsx
```

In development you should use a copy of the original database . In the case something goes
wrong, your original DB remains intact. So just repeat these steps for the second one.
In our config file you will find both API keys. Remember to use the development API key,
and when building for production, use the original one.

### PHP Setup

As previously mentioned, profile pictures are stored in the server using PHP.
If you would like to do the same, you need to replace the variable
`productionPHPTarget` in `src/Pages/Profile/profileUtils.tsx` with your own server URL:

```sh
"https://your-server.com/assets/php/save_image_on_server.php";
```

## Deploy

If you followed all of the above steps, you can proceed to locally run the
project with

```sh
npm start
```

If you would like to deploy the application to your own server, run

```sh
npm run build
```

This will create a `build` folder. Just copy all of the contents of the folder
to the root directory of your server.

<!-- ROADMAP -->

## Roadmap

See the [open
issues](https://github.com/dinis-rodrigues/tsb-web-app-react/issues) for a list
of proposed features (and known issues), if any.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Dinis Rodrigues - [Linkedin](https://www.linkedin.com/in/dinis-rodrigues/) - dinis.rodrigues@tecnico.ulisboa.pt

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/dinis-rodrigues/tsb-web-app-react.svg?style=for-the-badge
[contributors-url]: https://github.com/dinis-rodrigues/tsb-web-app-react/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/dinis-rodrigues/tsb-web-app-react.svg?style=for-the-badge
[forks-url]: https://github.com/dinis-rodrigues/tsb-web-app-react/network/members
[stars-shield]: https://img.shields.io/github/stars/dinis-rodrigues/tsb-web-app-react.svg?style=for-the-badge
[stars-url]: https://github.com/dinis-rodrigues/tsb-web-app-react/stargazers
[issues-shield]: https://img.shields.io/github/issues/dinis-rodrigues/tsb-web-app-react.svg?style=for-the-badge
[issues-url]: https://github.com/dinis-rodrigues/tsb-web-app-react/issues
[license-shield]: https://img.shields.io/github/license/dinis-rodrigues/tsb-web-app-react?style=for-the-badge
[license-url]: https://github.com/dinis-rodrigues/tsb-web-app-react/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/dinis-rodrigues
[product-screenshot]: public/assets/images/readMeImages/appScreen.png
