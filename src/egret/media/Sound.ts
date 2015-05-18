//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

module egret {

    /**
     * @class egret.Sound
     * @classdesc Sound 类允许您在应用程序中使用声音。
     * @link http://docs.egret-labs.org/post/manual/sound/playsound.html 播放音频
     *
     * @event egret.SoundEvent.SOUND_COMPLETE 在声音完成播放后调度。
     */
    export class Sound extends egret.EventDispatcher{

        /**
         * 背景音乐
         * @constant egret.Sound.MUSIC
         */
        public static MUSIC:string = "music";
        /**
         * 音效
         * @constant egret.Sound.EFFECT
         */
        public static EFFECT:string = "effect";
        public path:string = "";

        /**
         * 创建 egret.Sound 对象
         */
        constructor() {

        }

        /**
         * audio音频对象
         * @member {any} egret.Sound#audio
         */
        private audio:any = null;

        /**
         * 类型，默认为 egret.Sound.EFFECT。
         * 在 native 和 runtime 环境下，背景音乐同时只能播放一个，音效长度尽量不要太长。
         * @member {any} egret.Sound#audio
         */
        public type:string = Sound.EFFECT;

        /**
         * 当播放声音时，position 属性表示声音文件中当前播放的位置（以毫秒为单位）
         * @returns {number}
         */
        public get position():void {
            return this.audio ? this.audio.currentTime : 0;
        }

        /**
         * 播放声音
         * @method egret.Sound#play
         * @param loop {boolean} 是否循环播放，默认为false
         */
        public play(position:number = 0, loop:boolean = false):void {
            if (position === void 0) { position = 0; }
            if (loop === void 0) { loop = false; }
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.currentTime = position / 1000;
            sound.loop = loop;
            sound.play();
        }

        private _pauseTime:number = 0;
        public stop():void {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            this._pauseTime = 0;
            sound.currentTime = 0;
            sound.pause();
        }

        /**
         * 暂停声音
         * @method egret.Sound#pause
         */
        public pause():void {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.pause();
        }

        public replay():void {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.currentTime = this._pauseTime;
            this._pauseTime = 0;
            sound.play();
        }

        /**
         * 重新加载声音
         * @method egret.Sound#load
         */
        public load():void {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.load();
        }

        private _listeners:Array<any> = [];
        /**
         * 添加事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        public addEventListener(type:string, listener:Function, thisObject:any, useCapture:boolean = false):void {
            super.addEventListener(type, listener, thisObject, useCapture);
            var self = this;
            var sound = this.audio;
            if (!sound) {
                return;
            }
            var func = function () {
                self.dispatchEvent(new egret.SoundEvent(egret.SoundEvent.SOUND_COMPLETE));
            };
            var virtualType = self.getVirtualType(type);
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                if (bin.listener == listener && bin.thisObject == thisObject && bin.type == virtualType) {
                    return;
                }
            }
            this._listeners.push({ type: virtualType, listener: listener, thisObject: thisObject, useCapture: useCapture, func: func });
            this.audio.addEventListener(virtualType, func, false);
        }

        /**
         * 移除事件监听
         * @param type 事件类型
         * @param listener 监听函数
         */
        public removeEventListener(type:string, listener:Function, thisObject:any, useCapture:boolean = false):void {
            super.removeEventListener(type, listener, thisObject, useCapture);
            var self = this;
            var sound = this.audio;
            if (!sound) {
                return;
            }
            var virtualType = self.getVirtualType(type);
            for (var i = 0; i < self._listeners.length; i++) {
                var bin = self._listeners[i];
                if (bin.listener == listener && bin.thisObject == thisObject && bin.type == virtualType && bin.useCapture == useCapture) {
                    self._listeners.splice(i, 1);
                    self.audio.removeEventListener(virtualType, bin.func, false);
                    break;
                }
            }
        }

        private getVirtualType(type:string):string {
            switch (type) {
                case egret.SoundEvent.SOUND_COMPLETE:
                    return "ended";
                default:
                    return type;
            }
        }

        /**
         * 音量范围从 0（静音）至 1（最大音量）。
         * @returns number
         */
        public set volume(value:number) {
            var sound = this.audio;
            if (!sound) {
                return;
            }
            sound.volume = Math.max(0, Math.min(value, 1));
        }

        public get volume():number {
            return this.audio ? this.audio.volume : 0;
        }

        /**
         * @deprecated
         * 设置音量
         * @param value 值需大于0 小于等于 1
         */
        public setVolume(value:number):void {
            this.volume = value;
        }

        /**
         * @deprecated
         * 获取当前音量值
         * @returns number
         */
        public getVolume():number {
            return this.volume;
        }

        public preload(type:string, callback:Function = null, thisObj:any = null):void {
            this.type = type;
            egret.callLater(callback, thisObj);
        }

        public _setAudio(value:any):void {
            this.audio = value;
        }

        /**
         * 释放当前音频
         */
        public destroy():void {

        }
    }
}