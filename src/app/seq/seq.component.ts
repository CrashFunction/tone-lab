import {Component, Input, NgZone, OnInit} from '@angular/core';

declare const Tone: any;
import * as _ from 'lodash';

@Component({
    selector: 'app-seq',
    templateUrl: './seq.component.html',
    styleUrls: ['./seq.component.scss']
})
export class SeqComponent implements OnInit {

    value = 'c3 eb3 g3 c4';
    period = '4n';
    noteLength = '8n';

    signals = [];

    ngOnInit() {
    }

    isPlaying: boolean = false;

    sequence;

    activeSignal = -1;
    currentPeriod = 3;
    currentLength = 2;
    noteLengths = ['32n', '16n', '8n', '4n', '2n', '1m'];

    // from A0 to C8
    // public cv = new Tone.Scale(27, 4186);
    freqConv = new Tone.CtrlInterpolate([27, 4186]);

    public freq = new Tone.Signal();
    public gate = new Tone.Envelope({
        "attack" : 0.01,
        "decay" : 0,
        "sustain" : 1,
        "release" : 0.01,
    });
    constructor(private zone: NgZone) {
        this.signals = [
            new Tone.Signal(0),
            new Tone.Signal(0),
            new Tone.Signal(0),
            new Tone.Signal(0),
            new Tone.Signal(0),
            new Tone.Signal(0),
            new Tone.Signal(0),
            new Tone.Signal(0)
        ];
        this.configureSequence();
    }

    configureSequence() {
        let wasPlaying = false;
        if (this.sequence) {
            wasPlaying = this.sequence.state === 'started';
            this.sequence.dispose();
        }
        this.sequence = new Tone.Sequence((time, i) => {


            // from A0 to C8
            this.freqConv.index = this.signals[i].value;
            this.freq.linearRampToValue(this.freqConv.value, 0.01, time);
            this.gate.triggerAttackRelease(this.noteLength, time);

            Tone.Draw.schedule(() => {
                this.zone.run(() => this.activeSignal = i);
            }, time);

        }, _.range(8), this.period);
        if (wasPlaying) {
            this.sequence.start(0.01);
        }
    }

    setPeriod(i) {
        this.currentPeriod = i;
        this.period = this.noteLengths[i];
        this.configureSequence();
    }
    setLength(i) {
        this.currentLength = i;
        this.noteLength = this.noteLengths[i];
        this.configureSequence();
    }

    seq() {
        if (this.sequence) {
            this.sequence.stop(0.01);
        }
        this.configureSequence();
        this.sequence.start(0.01);
        this.isPlaying = true;
    }

    stop() {
        if (this.sequence) {
            this.sequence.stop(0.01);
            this.sequence.cancel(0.01);
        }
        this.activeSignal = -1;
        this.isPlaying = false;
    }

}