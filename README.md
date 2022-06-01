# usbNetworkManager
Application in NodeJS to update network data in Debian distro

After installing the application, it waits for a USB key containing the network configuration files. If these are present overwrites them with the current ones on the device.
Then restart the device.
It's tested on Asus Tinker Board and manage also a led connected to a GPIO pin of the board.

## PREREQUISITES

- Work on debian distro
- NPM, PM2 must be present 
- NodeJS>8 must be present 
- network files on usb drive (wpa.conf, interfaces) 

## HOW TO INSTALL

Run sh file:

./install.sh
