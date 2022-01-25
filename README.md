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
        <li><a href="#environment-variables-setup">Environment Variables Setup</a></li>
        <li><a href="#php-setup">PHP Setup</a></li>
      </ul>
    </li>
    <li><a href="#deploy">Deploy</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing Guidelines</a></li>
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

To setup your own database, it only takes 2 min.

1. Create a Firebase Project [here](https://firebase.google.com) with a name `your-application`
2. Setup User and Email authentication
3. Setup **Realtime Database** (not Firestore)
4. Import the database template from

```sh
src/config/dbTemplate.json
```

5. Import the database rules from

```sh
src/config/dbRules.json
```

6. Repeat the above steps to create a development database
   In development you should use a copy of the original database. In the case something goes
   wrong, your original DB remains intact. So just repeat these steps for the development
   database and give it a project name, for example, `your-application-dev`.

### Environment Variables Setup

To protect sensitive information on firebase API keys we take advantage of environment
variables, which remain private for developers, while maintaining a public repository.
These variables are stored in a `.env` file in the root of the repository. You can check
the template used in `template.env` and replace all of the variables with your own.
Don't forget to rename the file to only `.env` 😀

If you aren't using a development database, or a firebase token leave those fields empty
or remove them, as they are optional for the next step.

**Optional**

Now let's automate things! The project is already setup to always use the development database while
in development, and to use the original database when building for production (check `src/config/firebase.tsx`). But we
also want the development database to always be up to date with the original one, in
order to work with real data.

For this we take advantage of the [Firebase
CLI](https://firebase.google.com/docs/cli/#cli-ci-systems) to export the data from
the original database (`your-application`) and export it to the development database (`your-application-dev`)

Install `Firebase CLI` in your system:

```sh
npm install -g firebase-tools
```

**You only have to do this once**. Retrieve and copy the firebase CLI token from the terminal and add it to the `.env`
variable placeholder:

```sh
firebase login:ci
```

**You only have to do this once**. Setup the connection to the databases using the provided script, and follow the on-screen
instructions:

```sh
sh firebase_databases_setup.sh
```

Last step! Sync your original database with your development one by running our syncing
script. This will copy all of the data from the original to the development database:

```sh
sh firebase_databases_sync.sh
```

Since we previously configured the databases, you can now sync the databases whenever
you want, without configuring them again.

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

Contributions are what make the open source community such an amazing place to learn,
inspire, and create. Any contributions you make are **greatly appreciated**. To ensure a
good workflow for this repository please follow our contributing guidelines:

- [Contributin Guidelines](.github/docs/CONTRIBUTING.md)

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
