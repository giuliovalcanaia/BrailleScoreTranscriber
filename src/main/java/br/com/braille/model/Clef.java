package br.com.braille.model;

public class Clef {
    private Integer line;
    private Integer octaveChange;
    private ClefSign clefSign;

    public Integer getLine() {
        return line;
    }

    public void setLine(Integer line) {
        this.line = line;
    }

    public Integer getOctaveChange() {
        return octaveChange;
    }

    public void setOctaveChange(Integer octaveChange) {
        this.octaveChange = octaveChange;
    }

    public ClefSign getClefSign() {
        return clefSign;
    }

    public void setClefSign(ClefSign clefSign) {
        this.clefSign = clefSign;
    }

}
