.PHONY: build clean dev test test-e2e lint preview install

build: install
	npm run build:offline
	npm run build
	cp dist-offline/offline.html dist/tesssera_recovery.html
	mkdir -p dist/vendor-sources/secrets dist/vendor-sources/qrcode
	cp src/vendor/secrets/shamir.ts dist/vendor-sources/secrets/shamir.ts
	cp src/vendor/qrcode/qrcode-esm.js dist/vendor-sources/qrcode/qrcode-esm.js

clean:
	rm -rf dist dist-offline

dev:
	npx vite

test:
	npm test

test-e2e:
	npx playwright test

lint:
	npm run lint

preview:
	npx vite preview

install: node_modules

node_modules: package-lock.json
	npm ci
	@touch node_modules
