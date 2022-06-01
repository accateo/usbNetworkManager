#!/bin/sh

# Installer usbManager for Asus Tinker
# NPM, PM2 and NodeJS>8 must be present 
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>\e[1;31;42mUSBManager installer\e[0m"
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>\e[1;31;42mInstallation in progress...\e[0m"
npm install
#pm2 manager
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>\e[1;31;42mEnable on startup...\e[0m";
pm2 start usbManager.js --no-autorestart
pm2 update
pm2 startup
#reboot
echo -e ">>>>>>>>>>>>>>>>>>>>>>>>>> \e[1;31;42mInstallation completed!\e[0m"
echo "Reboot";
sudo reboot

return 0;