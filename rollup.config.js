function getConfig(bundle){
    return {
        // // Make everything global
        // context: 'window',
        
        input: bundle.input,
        output: {
            strict: true,
            name: bundle['output.name'],
            file: bundle['output.file'],
            globals: {
                ...bundle['output.globals'],
            },
            format: 'umd',
            sourcemap: true,
        },
        external: {
            ...bundle.external,
        },
    }
}

/*
TODO: Add `banner` to config
*/
export default [
    getConfig({
        'input': 'lib/index.js',
        'output.file': 'dist/ng-di.js',
        'output.name': 'di',
    }),
    getConfig({
        'input': 'mock/index.js',
        'output.file': 'dist/mock.js',
        'output.name': 'diMock',
        'output.globals': {
            'ng-di': 'di'
        },
        'external': [
            'ng-di',
        ],
    }),
];
