# borgnix-cloud-ide

## INSTALL

The application needs [Arduino IDE](https://www.arduino.cc/en/main/software) and [Arduino-Makefile](https://github.com/sudar/Arduino-Makefile).

Install Arduino IDE by download the latest version for you platform [here](https://www.arduino.cc/en/main/software), then extract or install it.

Install Arduino-Makefile by clone the latest version from github with the following command:

```bash
git clone https://github.com/sudar/Arduino-Makefile.git
```


```bash
npm i git+https://github.com/Orientsoft/borgnix-cloud-ide.git
```

For development install with [borgnix-project-manager](https://github.com/Orientsoft/borgnix-project-manager) and [borgnix-arduino-compiler](https://github.com/Orientsoft/borgnix-arduino-compiler), run the following commands:

```bash
git clone https://github.com/Orientsoft/borgnix-project-manager.git
cd borgnix-project-manager
npm i
cd ..
git clone https://github.com/Orientsoft/borgnix-arduino-compiler.git
cd borgnix-arduino-compiler
npm i
cd ..
git clone https://github.com/Orientsoft/borgnix-cloud-ide.git
cd borgnix-cloud-ide
npm i
gulp dev-install
```

## CONFIG

You **HAVE TO** change the config file before you start using the application.

Open `config/config.json`, replace the default values with your actual settings.

1. *arduinoDir*: the path to you Arduino IDE, for osx the path may be `/Applications/Arduino.app/Contents/Java`.
2. *arduinoMkDir*: the path to your Arduino-Makefile directory.
3. *projectRoot*: the directory to store user projects.
4. *uploadDir*: the directory to store files uploaded by users.
5. *arduinoLibs*: the directory to store libraries shared by all users.

## USAGE

To start the server, run:

```bash
npm start
```

Then open `http://127.0.0.1:3000` in your browser to use the client.

## TODO and Known Issues

1. Improve UI design and details
2. Show files in sub-directory in `ProjectManager`
4. Create a new project using a template project
5. User validation
6. When a project is deleted, the project select field and the editor show diffrent project
