#!/usr/bin/env sh

dateStamp=`date +%Y-%m-%d`
rootPath=_backups
backupPath=$rootPath/$dateStamp
dumpPath=$backupPath/mongo
tarName=mongo-$dateStamp.gz
tarPath=$backupPath/$tarName

mkdir -p $dumpPath
mongodump --db fiore --out $dumpPath
tar -czf $tarPath $dumpPath
aws s3 cp $tarPath s3://incrossada-backups/mongo/$tarName --region us-standard
rm -rf $backupPath

