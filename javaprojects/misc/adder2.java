package javaprojects.misc;

public class adder2 {
    public static void main(String[] args){
        long m = 234233;
        long n = 342;
        boolean c = false;
        StringBuilder out = new StringBuilder();
        while(m >= 1 || n >= 1){
            boolean a = (m % 2) == 1;
            boolean b = (n % 2) == 1;
            boolean p = (a != b) != c;
            c = a && b || a && c || b && c;
            System.out.println(p);
            m>>=1;
            n>>=1;
        }
        System.out.println(c);
    }
}
