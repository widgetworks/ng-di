/*
 * ng-di
 * https://github.com/jmenidara/ng-di
 *
 * Copyright (c) 2013 Javier Mendiara Cañardo
 * Licensed under the MIT license.
 */

import * as _di from "./module";
import * as _injector from "./injector";
import * as _utils from "./utils";

export const module = _di.setupModuleLoader(exports);
export const injector = _injector.createInjector;
export const annotate = _injector.annotate;
export const utils = _utils;

export const di = {
    module,
    injector,
    annotate,
    utils,
};
export default di; 
