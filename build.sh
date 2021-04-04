__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cp -n $__dirname/backend/src/config.sample.json $__dirname/build/config.json
mv $__dirname/build/config.json /tmp/config_729384792348.json

mkdir $__dirname/build
mkdir $__dirname/build/node_modules
mkdir /tmp/node_modules2749824792384749
mv $__dirname/build/node_modules/* /tmp/node_modules2749824792384749

rm -r -f $__dirname/build
mkdir $__dirname/build
mkdir $__dirname/build/node_modules

mv /tmp/config_729384792348.json $__dirname/build/config.json
mv /tmp/node_modules2749824792384749/* $__dirname/build/node_modules

rm -r -f /tmp/node_modules2749824792384749

cd $__dirname/backend
npm run build

cd $__dirname

mv -f $__dirname/backend/build/* $__dirname/build
cp $__dirname/backend/package.json $__dirname/build/package.json
cp $__dirname/backend/package-lock.json $__dirname/build/package-lock.json

mkdir $__dirname/build/mail/templates
cp $__dirname/backend/src/mail/templates/* $__dirname/build/mail/templates

rm $__dirname/build/**/*.js.map
rm $__dirname/build/**/**/*.js.map
rm $__dirname/build/**/**/**/*.js.map
rm $__dirname/build/*.js.map

cd $__dirname/frontend

npm run build

cd $__dirname

mkdir $__dirname/build/public
mv $__dirname/frontend/build/* $__dirname/build/public

rm -f $__dirname/build.zip

mv $__dirname/build/node_modules/* /tmp/node_modules2749824792384749
mv $__dirname/build/config.json $__dirname/build/config.build.json

zip -r $__dirname/build.zip $__dirname/build

mv $__dirname/build/config.build.json $__dirname/build/config.json
mv /tmp/node_modules2749824792384749/* $__dirname/build/node_modules