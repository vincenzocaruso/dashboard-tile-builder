"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const clsx_1 = __importDefault(require("clsx"));
const style = __importStar(require("./example.module.scss"));
function getDefaultConfiguration() {
    return {
        title: ''
    };
}
const panelConfiguration = React.memo(function PanelConfiguration() {
    return null;
});
function getTileActions() {
    return [{
            icon: 'devices2',
            label: 'action 1',
            onClick: () => { alert('action 1'); }
        }, {
            icon: 'wifi',
            label: 'action 2',
            onClick: () => { alert('action 2'); }
        }, {
            icon: 'internetSharing',
            label: 'action 3',
            disabled: true,
            onClick: () => { alert('action 3'); }
        }];
}
function getAvailableSizes() {
    return [{ h: 2, w: 2 }];
}
const render = React.memo(function Render({ props }) {
    return <div className={(0, clsx_1.default)(style.content)}>
        {props.title}
    </div>;
});
const example = {
    getDefaultConfiguration,
    panelConfiguration,
    getTileActions,
    getAvailableSizes,
    render
};
exports.default = example;
//# sourceMappingURL=example.jsx.map