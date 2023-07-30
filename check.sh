#!/bin/bash
# check-head(commit-id)

echo blanch name $1
while true
do
	CID0=`git log --pretty=format:"%H"|head -n 1`
	# echo $CID0
	CID1=`git ls-remote origin $1|awk '{print $1}'`
	# echo $CID1
	if [ $CID0 != $CID1 ]; then
		echo "change on the remote. Restart app.js.";
		git pull origin $1;
		npm ci;
		pkill -f ^node;
		echo $POD_IP
		PODIP=$POD_IP node index &
	fi
	sleep 30;
done