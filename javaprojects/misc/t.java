package javaprojects.misc;

public class t {
    public static void main(String[] args){
        int s = 0;
        int t = 0;
        for(int p = 1; p<=9; p++){
            for(int q = 1; q<=9; q++){
                if(p == q) continue;
                if((p + p*q) & 1 == 1) s++;
                t++;
            }
        }
        System.out.println(s+", "+t);
    }
}