package com.example.demo.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sub_attribute_ratings")
public class SubAttributeRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "attribute_rating_id", nullable = false)
    private AttributeRating attributeRating;

    @ManyToOne
    @JoinColumn(name = "sub_attribute_id", nullable = false)
    private SubAttribute subAttribute;

    @Column(name = "rating", precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "comment")
    private String comment;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public AttributeRating getAttributeRating() {
        return attributeRating;
    }

    public void setAttributeRating(AttributeRating attributeRating) {
        this.attributeRating = attributeRating;
    }

    public SubAttribute getSubAttribute() {
        return subAttribute;
    }

    public void setSubAttribute(SubAttribute subAttribute) {
        this.subAttribute = subAttribute;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

}
