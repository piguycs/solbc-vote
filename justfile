@run:
    echo "TODO"
    exit 1

@build:
    cd anchor && \
    anchor build

@test:
    # just copy-so
    just test-skiplocalval

@test-skiplocalval:
    cd anchor && \
    anchor test --skip-deploy --skip-local-validator

@test-localval:
    cd anchor && \
    anchor test --skip-deploy

@copy-so:
    cp anchor/target/deploy/voting.so anchor/tests/fixtures/
