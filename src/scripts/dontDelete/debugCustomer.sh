echo "Syncing Production to local"
y | monsoon spp local

echo "Starting client"
cd ~/Development/harvest
yarn ios 
