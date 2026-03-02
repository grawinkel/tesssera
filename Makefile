.PHONY: build clean dev test test-e2e lint preview install

build: install
	npm run build:offline
	npm run build
	cp dist-offline/offline.html dist/tesssera_recovery.html

clean:
	rm -rf dist dist-offline

dev:
	npx vite

test: install
	npm test

test-e2e: install
	npx playwright test

lint:
	npm run lint

preview:
	npx vite preview

install: node_modules

node_modules: package-lock.json
	npm ci
	@touch node_modules
