@run:
    echo "TODO"
    exit 1

@build:
    cd anchor && \
    anchor build

@test:
    just test-skiplocalval

@test-skiplocalval:
    cd anchor && \
    anchor test --skip-deploy --skip-local-validator

@test-localval:
    cd anchor && \
    anchor test --skip-deploy
