package javaprojects.misc;

public class adder {
    public static void main(String[] args){
        int a = 100;
        int b = 29;
        boolean c = false;
        int v = 0;
        int p =1;
        while(a >= 1 || b >= 1){
            v+=p*(((a & 1) ==( b & 1)) == c ? 1 : 0); //(a xor b) xor c
            c = c && (((a & 1) == 1) || ((b & 1) == 1)) || ((a & 1) == 1 && (b & 1) == 1); //((a or b) and c) or a and b
            a>>=1;
            b>>=1;
            p<<=1;
        }
        v+=p*(c == true ? 1 : 0);
        System.out.println(v);
    }
}
